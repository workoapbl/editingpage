const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const announcementFilePath = process.argv[2];
if (!announcementFilePath) {
    console.error('Please provide the path to the announcement file.');
    process.exit(1);
}

const indexFilePath = path.join(__dirname, 'index.html');
const allAnnouncementsFilePath = path.join(__dirname, 'all-announcements.html');

fs.readFile(announcementFilePath, 'utf8', (err, announcementData) => {
    if (err) {
        console.error('Error reading the announcement file:', err);
        return;
    }

    const dom = new JSDOM(announcementData);
    const document = dom.window.document;

    const title = document.querySelector('h1').textContent;
    const date = document.querySelector('.date').textContent;
    const previewParagraphs = Array.from(document.querySelectorAll('#announcement-content p')).slice(0, 2).map(p => p.textContent);

    const previewHTML = `
        <div class="announcement">
            <a href="${announcementFilePath}" class="announcement-link">
                <h3>${title}</h3>
            </a>
            <p class="date">${date}</p>
            <p class="preview">${previewParagraphs[0]}</p>
            <p class="preview">${previewParagraphs[1]}...</p>
        </div>
    `;

    const allAnnouncementsHTML = `
        <li>
            <a href="${announcementFilePath}">
                <h3>${title}</h3>
                <p class="date">${date}</p>
            </a>
        </li>
    `;

    updateIndexFile(previewHTML);

    updateAllAnnouncementsFile(allAnnouncementsHTML);
});

function updateIndexFile(previewHTML) {
    fs.readFile(indexFilePath, 'utf8', (err, indexData) => {
        if (err) {
            console.error('Error reading the index file:', err);
            return;
        }

        const indexDom = new JSDOM(indexData);
        const indexDocument = indexDom.window.document;
        const announcementsContainer = indexDocument.querySelector('.announcements-container');
        announcementsContainer.innerHTML = previewHTML + announcementsContainer.innerHTML;

        const announcements = Array.from(announcementsContainer.children);
        if (announcements.length > 3) {
            announcements.slice(3).forEach(announcement => announcement.remove());
        }

        fs.writeFile(indexFilePath, indexDom.serialize(), (err) => {
            if (err) {
                console.error('Error writing the index file:', err);
                return;
            }

            console.log('Preview added to index.html successfully!');
        });
    });
}

function updateAllAnnouncementsFile(allAnnouncementsHTML) {
    fs.readFile(allAnnouncementsFilePath, 'utf8', (err, allAnnouncementsData) => {
        if (err) {
            console.error('Error reading the all-announcements file:', err);
            return;
        }

        const allAnnouncementsDom = new JSDOM(allAnnouncementsData);
        const allAnnouncementsDocument = allAnnouncementsDom.window.document;
        const allAnnouncementsList = allAnnouncementsDocument.querySelector('.all-announcements-list');
        allAnnouncementsList.innerHTML = allAnnouncementsHTML + allAnnouncementsList.innerHTML;

        fs.writeFile(allAnnouncementsFilePath, allAnnouncementsDom.serialize(), (err) => {
            if (err) {
                console.error('Error writing the all-announcements file:', err);
                return;
            }

            console.log('Entry added to all-announcements.html successfully!');
        });
    });
}
