const blockedSites = document.querySelector('.blocked-sites ul');
const siteForm = document.querySelector('#site');
const addProfileButton = document.querySelector('#create-new-profile-button');
const deleteProfileButton = document.querySelector('#delete-current-profile-button');

const getSites = browser.storage.local.get('default-sites');
const getProfiles = browser.storage.local.get('profiles')

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

function loadProfiles () {

}

function createProfile(event) {
  console.log("CreateProfile");
  var name = window.prompt("Name:","");

  getProfiles.then((storage) => {
    storage.profiles.push(url);
    browser.storage.local.set({
      profiles: profiles.sites,
    });
  });

}

function getCurrentProfile () {

}

function deleteProfile(event) {
  console.log("DeleteProfile");

  var activeProvile = document.querySelector("#selected-active-profile").value;

  var decision = confirm("This will delete the profile: " + activeProvile);

  if ( decision ) {
    // Code for profile deletion
  }

}

siteForm.addEventListener('submit', saveSite);
blockedSites.addEventListener('click', deleteSite);

addProfileButton.addEventListener('click', createProfile);
deleteProfileButton.addEventListener('click', deleteProfile)

document.addEventListener('DOMContentLoaded', restoreOptions);
