const blockedSites = document.querySelector('.blocked-sites ul');
const siteForm = document.querySelector('#siteForm');
const addProfileButton = document.querySelector('#create-new-profile-button');
const deleteProfileButton = document.querySelector('#delete-current-profile-button');
const selectedActiveProfileField = document.querySelector('#selected-active-profile')

const getSites = browser.storage.local.get('sites');
const getProfiles = browser.storage.local.get('profile_data')

function addToBlockedList(text) {
  const label = document.createElement('p');
  label.textContent = text;
  const button = document.createElement('button');
  button.textContent = 'Delete';

  const listItem = document.createElement('li');
  listItem.appendChild(label);
  listItem.appendChild(button);

  blockedSites.appendChild(listItem);
}

function hasNoProtocol(url) {
  const regex = /^[a-zA-Z]{3,}:\/\//;
  return !regex.test(url);
}

function hasNoExtension(url) {
  const regex = /(\w+\.\w+)$/;
  return !regex.test(url);
}

function restoreOptions() {
  blockedSites.innerHTML = '';

  getSites.then( (storage) => {
      var sites = storage.sites
      getProfiles.then( (profile_storage) => {
        const cp = profile_storage.profile_data["current_profile"]
        sites[cp].forEach( (site) => {
          addToBlockedList(site);
        })
    }).then( () => {
      reloadProfiles()
    })
  })
}

function saveSite(event) {
  event.preventDefault();

  const url = siteForm.site.value;
  if (url.length == 0) { return; }
  addToBlockedList(url);
  siteForm.site.value = '';

  getSites.then( (storage) => {
    var sites = storage.sites
    const current_profile = getCurrentProfile()
    current_profile.then( (cp) => {
      sites[cp].push(url)
      return browser.storage.local.set({sites})
    })

  })

}

function deleteSite(event) {
  if (event.target.nodeName === 'BUTTON') {
    const toDelete = event.target.parentElement;
    const toDeleteParent = toDelete.parentElement;
    const toDeleteText = event.target.previousSibling.textContent;
    toDeleteParent.removeChild(toDelete);


    getSites.then((storage) => {
      var sites = storage.sites
      const current_profile = getCurrentProfile()
      current_profile.then( (cp) => {
        const i = sites[cp].indexOf(toDeleteText);

        if (i !== -1) {
          sites[cp].splice(i, 1);
        }

        browser.storage.local.set({sites});
      });
    })

  }
 }

function reloadProfiles() {
  getProfiles.then((storage) => {
    var activeProfileDiv = document.querySelector("#selected-active-profile");
    activeProfileDiv.innerHTML = "";  // Clear old profile list

    // Update new profile list
    storage.profile_data["stored_profiles"].forEach((profile) => {
      const el = document.createElement('option');
      el.value = profile;
      el.innerHTML = profile;
      activeProfileDiv.append(el);
    })

    activeProfileDiv.value = storage.profile_data["current_profile"]
  })
}

function createProfile(event) {
  var name = window.prompt("Name:","");

  getProfiles.then((storage) => {
    var profile_data = storage.profile_data;
    profile_data.stored_profiles.push(name);

    getSites.then((storage) => {
      var sites = storage.sites
      sites[name] = []
      return browser.storage.local.set({sites})
    })
    return browser.storage.local.set({profile_data});
  }).then( () => { restoreOptions() })

}

function deleteProfile(event) {
  var activeProfile = document.querySelector("#selected-active-profile").value;
  var decision = confirm("This will delete the profile: " + activeProfile);

  if ( decision ) {
    getProfiles.then((storage) => {
      var profile_data = storage.profile_data;
      const i = profile_data.stored_profiles.indexOf(activeProfile);
      if (i !== -1) {
        profile_data.stored_profiles.splice(i, 1);
      }
      return browser.storage.local.set({profile_data});
    }).then( () => { restoreOptions() });
  }


}

async function getCurrentProfile() {
  const current_profile = await getProfiles.then((storage) => {
    return storage.profile_data["current_profile"]
  });

  return current_profile
}

async function getSitesForCurrentProfile () {
  var current_profile = await getProfiles.then( (profile_storage) => {
    var profile_data = profile_storage.profile_data
    return profile_data["current_profile"] })

  var sites = await getSites.then((site_storage) => {
    var sites = site_storage.sites
    return sites
    })

  return sites[current_profile]
}

function setProfile(event) {
  const activeProfile = selectedActiveProfileField.value;

  getProfiles.then((storage) => {
    var profile_data = storage.profile_data;
    profile_data.current_profile = activeProfile;
    return browser.storage.local.set({profile_data});
  }).then( () => { restoreOptions() })

}

siteForm.addEventListener('submit', saveSite);
blockedSites.addEventListener('click', deleteSite);

addProfileButton.addEventListener('click', createProfile);
deleteProfileButton.addEventListener('click', deleteProfile)

selectedActiveProfileField.addEventListener('change', setProfile)

document.addEventListener('DOMContentLoaded', restoreOptions);
