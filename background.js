const ImpulseBlocker = {
  extStatus: 'on',
  profile: 'default',

  /**
   * Starts the blocker. Adds a listener so that if new websites is added
   * to the blocked list the listener is refreshed.
   */
  init: () => {
    browser.storage.local.get('profile_data').then((storage) => {

      if (typeof storage.profile_data === 'undefined'){
        // First time running plugin
        profile_data = {};
        profile_data["current_profile"] = 'default';
        profile_data["stored_profiles"] = ["default"];
        return browser.storage.local.set({profile_data});
      }
    });

    const handlingStorage = browser.storage.local.get('sites').then((storage) => {
      if (typeof storage.sites === 'undefined') {
        var sites = {}
        sites["default"] = []
        return browser.storage.local.set({sites});
      }
    });

    handlingStorage.then(ImpulseBlocker.setBlocker);
  },

  /**
   * Redirects the tab to local "You have been blocked" page.
   */
  redirect: (requestDetails) => {
    const original = encodeURIComponent(requestDetails.url);
    const interceptPage = `/resources/redirect.html?target=${original}`;
    browser.tabs.update(requestDetails.tabId, { url: interceptPage });
  },

  /**
   * Returns the current status of the extension.
   */
  getStatus: () => ImpulseBlocker.extStatus,

  /**
   * Returns the currently activated profile
   */
  getProfile: () => ImpulseBlocker.profile,

  setProfile: (profile_name) => {
    browser.storage.local.get('profile_data').then((storage) => {
        profile_data = storage.profile_data;
        profile_data["current_profile"] = profile_name;
        ImpulseBlocker.profile = profile_name;
        return browser.storage.local.set({profile_data});
      }
    )
  },


  /**
   * Sets the current status of the extension.
   * @param string status
   */
  setStatus: (status) => {
    ImpulseBlocker.extStatus = status;
    let icon = 'icons/icon96.png';
    if (ImpulseBlocker.extStatus !== 'on') {
      icon = 'icons/icon96-disabled.png';
    }

    browser.browserAction.setIcon({
      path: icon,
    });
  },

  /**
   * Fetches profile and then:
   * Fetches blocked websites lists, attaches them to the listener provided
   * by the WebExtensions API.
   */
  setBlocker: () => {
    browser.storage.local.get('sites').then((storage) => {
      const pattern = storage.sites[getProfile()].map(item => `*://*.${item}/*`);

      browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);
      if (pattern.length > 0) {
        browser.webRequest.onBeforeRequest.addListener(
          ImpulseBlocker.redirect,
          { urls: pattern, types: ['main_frame'] },
          ['blocking'],
        );
      }
    });

    browser.storage.onChanged.addListener(() => {
      // if the extension off we should not be bothered by restarting with new list
      if (ImpulseBlocker.getStatus() === 'on') {
        ImpulseBlocker.setBlocker();
      }
    });

    ImpulseBlocker.setStatus('on');
  },

  /**
   * Removes the web request listener and turns the extension off.
   */
  disableBlocker: () => {
    browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);
    ImpulseBlocker.setStatus('off');
  },

  /**
   * Add a website to the blocked list
   * @param  {string} url Url to add to the list
   */
  addSite: (url) => {
    browser.storage.local.get('sites').then((storage) => {
      storage.sites.push(url);
      browser.storage.local.set({
        sites: storage.sites,
      });
    });
  },

  /**
   * Add a website to the blocked list
   * @param  {string} url Url to remove to the list
   */
  removeSite: (url) => {
    browser.storage.local.get('sites').then((storage) => {
      const i = storage.sites.indexOf(url);
      if (i !== -1) {
        storage.sites.splice(i, 1);
      }
      browser.storage.local.set({
        sites: storage.sites,
      });
    });
  },
};

ImpulseBlocker.init();

// Helper functions to access object literal from menubar.js file. These funcitons are
// easily accessible from the getBackgroundPage instance.
function getStatus() {
  return ImpulseBlocker.getStatus();
}

function getProfile() {
  return ImpulseBlocker.getProfile();
}


function disableBlocker() {
  ImpulseBlocker.disableBlocker();
}

function setBlocker() {
  ImpulseBlocker.setBlocker();
}

function getDomain() {
  return browser.tabs.query({ active: true, currentWindow: true });
}

function getSites() {
  return browser.storage.local.get('sites');
}


function addCurrentlyActiveSite() {
  const gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true });
  return gettingActiveTab.then((tabs) => {
    const url = new URL(tabs[0].url);
    ImpulseBlocker.addSite(url.hostname.replace(/^www\./, ''));
  });
}

function removeCurrentlyActiveSite() {
  const gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true });
  return gettingActiveTab.then((tabs) => {
    const url = new URL(tabs[0].url);
    ImpulseBlocker.removeSite(url.hostname.replace(/^www\./, ''));
  });
}

console.log("veva! bögballle")
