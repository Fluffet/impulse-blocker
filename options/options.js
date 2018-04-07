const blockedSites = document.querySelector('.blocked-sites ul');
const siteForm = document.querySelector('#site');
const addProfileButton = document.querySelector('#create-new-profile-button');
const deleteProfileButton = document.querySelector('#delete-current-profile-button');

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
  getSites.then((storage) => {
    storage.sites.forEach((site) => {
      addToBlockedList(site);
    });
  });

  reloadProfiles()
}

function saveSite(event) {
  event.preventDefault();
  const url = siteForm.site.value;
  if (url.length == 0) { return; }
  addToBlockedList(url);
  siteForm.site.value = '';

  getSites.then((storage) => {
    storage.sites.push(url);
    browser.storage.local.set({
      sites: storage.sites,
    });
  });
}

function deleteSite(event) {
  if (event.target.nodeName === 'BUTTON') {
    const toDelete = event.target.parentElement;
    const toDeleteParent = toDelete.parentElement;
    const toDeleteText = event.target.previousSibling.textContent;
    toDeleteParent.removeChild(toDelete);

    getSites.then((storage) => {
      const i = storage.sites.indexOf(toDeleteText);
      if (i !== -1) {
        storage.sites.splice(i, 1);
      }
      browser.storage.local.set({
        sites: storage.sites,
      });
    });
  }
}


function reloadProfiles() {
  getProfiles.then((storage) => {
    var activeProfileDiv = document.querySelector("#selected-active-profile");

    activeProfileDiv.innerHTML = "";

    storage.profile_data["stored_profiles"].forEach((profile) => {
      // Append profiles
      const el = document.createElement('option');
      el.value = profile;
      el.innerHTML = profile;
      activeProfileDiv.append(el);
    })
  })
}

function createProfile(event) {
  var name = window.prompt("Name:","");

  getProfiles.then((storage) => {
    var profile_data = storage.profile_data;
    profile_data.stored_profiles.push(name);
    return browser.storage.local.set({profile_data});
  });

  restoreOptions();
}

function getCurrentProfile() {
  getProfiles.then((storage) => {
    return storage.profile_data[current_profile];
  });
}

function setProfile(profile_name) {
  getProfiles.then((storage) => {
    var profile_data = storage.profile_data;
    profile_data.current_profile = profile_name;
    return browser.storage.local.set({profile_data});
  });

  restoreOptions();
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
    });
  }

  restoreOptions();
}

siteForm.addEventListener('submit', saveSite);
blockedSites.addEventListener('click', deleteSite);

addProfileButton.addEventListener('click', createProfile);
deleteProfileButton.addEventListener('click', deleteProfile)

document.addEventListener('DOMContentLoaded', restoreOptions);
