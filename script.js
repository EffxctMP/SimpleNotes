// DOM elementen voor het hoofdformulier
const noteIdInput = document.getElementById('note-id');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content'); // Nu een div
const noteTagsInput = document.getElementById('note-tags'); // Nieuw: Tag invoerveld
const reminderDatetimeInput = document.getElementById('reminder-datetime');
const reminderInputGroup = document.getElementById('reminder-input-group');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const noteForm = document.querySelector('.note-form'); // Referentie naar het hoofdformulier

// Toolbar knoppen voor het hoofdformulier
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const underlineBtn = document.getElementById('underline-btn');
const colorPicker = document.getElementById('color-picker');
const fontSizeSelect = document.getElementById('font-size-select');
const mainColorSwatch = document.getElementById('main-color-swatch'); // Visuele kleur swatch


// DOM elementen voor de full-screen modal
const fullscreenEditModal = document.getElementById('fullscreen-edit-modal');
const modalNoteIdInput = document.getElementById('modal-note-id');
const modalNoteTitleInput = document.getElementById('modal-note-title');
const modalNoteContentInput = document.getElementById('modal-note-content'); // Nu een div
const modalNoteTagsInput = document.getElementById('modal-note-tags'); // Nieuw: Tag invoerveld voor modal
const modalReminderDatetimeInput = document.getElementById('modal-reminder-datetime');
const modalReminderInputGroup = document.getElementById('modal-reminder-input-group');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');

// Toolbar knoppen voor de modal
const modalBoldBtn = document.getElementById('modal-bold-btn');
const modalItalicBtn = document.getElementById('modal-italic-btn');
const modalUnderlineBtn = document.getElementById('modal-underline-btn');
const modalColorPicker = document.getElementById('modal-color-picker');
const modalFontSizeSelect = document.getElementById('modal-font-size-select');
const modalColorSwatch = document.getElementById('modal-color-swatch'); // Visuele kleur swatch voor modal


// Display-elementen voor de lijsten
const newNoteDashboardDisplay = document.getElementById('new-note-dashboard-display');
const allNotesDisplay = document.getElementById('all-notes-display');
const allNotesViewContainer = document.getElementById('all-notes-view-container'); // Container voor alle notities (incl. filters)
const allNotesFilterTagsContainer = document.getElementById('all-notes-filter-tags'); // Container voor filter tags
const remindersListDisplay = document.getElementById('reminders-list-display');
const remindersViewContainer = document.getElementById('reminders-view-container'); // Container voor herinneringen (incl. filters)
const remindersFilterTagsContainer = document.getElementById('reminders-filter-tags'); // Container voor filter tags


// Berichten voor lege lijsten
const noRecentNotesMessage = document.getElementById('no-recent-notes-message');
const noAllNotesMessage = document.getElementById('no-all-notes-message');
const noRemindersMessage = document.getElementById('no-reminders-message');

// Tabblad knoppen
const tabNewNote = document.getElementById('tab-new-note');
const tabAllNotes = document.getElementById('tab-all-notes');
const tabReminders = document.getElementById('tab-reminders');

// Reminder Notification Modal DOM elements
const reminderNotificationModal = document.getElementById('reminder-notification-modal');
const notificationTitle = document.getElementById('notification-title');
const notificationContent = document.getElementById('notification-content');
const notificationCloseBtn = document.getElementById('notification-close-btn');

// Settings Modal DOM elements
const settingsIcon = document.getElementById('settings-icon');
const settingsModal = document.getElementById('settings-modal');
const newTagInput = document.getElementById('new-tag-input');
const addNewTagBtn = document.getElementById('add-new-tag-btn');
const allTagsList = document.getElementById('all-tags-list');
const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');


let notes = []; // Array om notities/herinneringen op te slaan
let allTags = []; // Nieuw: Array om alle unieke tags op te slaan
let currentView = 'new_note'; // Huidige actieve weergave: 'new_note', 'all_notes' of 'reminders'
let activeFilterTag = null; // De momenteel geactiveerde filter tag

// Functie om berichten in de console te loggen
function logMessage(message) {
    console.log(message);
}

// Laad notities en tags vanuit Local Storage
function loadData() {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
    const storedTags = localStorage.getItem('allTags');
    if (storedTags) {
        allTags = JSON.parse(storedTags);
    }

    // Migratie: Zorg ervoor dat alle notities de 'notified' en 'tags' properties hebben
    notes.forEach(note => {
        if (note.reminderDatetime && typeof note.notified === 'undefined') {
            note.notified = false;
        }
        if (typeof note.tags === 'undefined') {
            note.tags = [];
        }
    });

    // Populatie allTags als deze leeg is bij eerste keer laden
    if (allTags.length === 0 && notes.length > 0) {
        const uniqueTagsFromNotes = new Set();
        notes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => uniqueTagsFromNotes.add(tag));
            }
        });
        allTags = Array.from(uniqueTagsFromNotes).sort();
        saveAllTags(); // Sla de nieuw gepopuleerde tags op
    }
    
    renderAllViews();
    switchView(currentView);
}

// Sla notities op in Local Storage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
    renderAllViews(); // Render alles opnieuw na opslaan
    switchView(currentView); // Zorg ervoor dat de juiste weergave actief is
}

// Sla alle tags op in Local Storage
function saveAllTags() {
    localStorage.setItem('allTags', JSON.stringify(allTags));
    renderAllViews(); // Update UI na opslaan van tags
}


// Reset het hoofdformulier
function resetMainForm() {
    noteIdInput.value = '';
    noteTitleInput.value = '';
    noteContentInput.innerHTML = ''; // Gebruik innerHTML voor contenteditable div
    noteContentInput.setAttribute('placeholder', 'Inhoud...'); // Reset placeholder
    noteTagsInput.value = ''; // Reset tags input
    reminderDatetimeInput.value = '';
    deleteNoteBtn.classList.add('hidden');

    // Reset toolbar values
    colorPicker.value = '#FFFFFF'; // Set color picker to white
    mainColorSwatch.style.backgroundColor = '#FFFFFF'; // Reset color swatch to white
    fontSizeSelect.value = '3'; // Set font size to normal (3)

    // Deactivate toolbar buttons
    updateToolbarActiveStates(noteContentInput, boldBtn, italicBtn, underlineBtn);


    // Pas de tekst van de opslagknop aan op basis van de huidige weergave
    if (currentView === 'reminders') {
        saveNoteBtn.textContent = 'Herinnering Opslaan';
        reminderInputGroup.classList.remove('hidden'); // Toon herinneringsveld als we in reminders-tab zijn
    } else {
        saveNoteBtn.textContent = 'Notitie Opslaan';
        reminderInputGroup.classList.add('hidden'); // Verberg herinneringsveld voor notities
    }
}

// Functie om tags te parsen uit een komma-gescheiden string
function parseTags(tagsString) {
    return tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
}

// Render de 3 meest recente notities voor het 'Nieuwe Notitie' scherm
function renderNewNoteDashboard() {
    newNoteDashboardDisplay.innerHTML = '<h2 class="text-2xl font-bold mb-4 text-center">Meest Recente Notities</h2>'; // Reset en titel
    noRecentNotesMessage.classList.add('hidden'); // Verberg het bericht standaard

    // We tonen hier de meest recente items, ongeacht of ze tags of herinneringen zijn
    const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentNotes = sortedNotes.slice(0, 3); 

    if (recentNotes.length === 0) {
        newNoteDashboardDisplay.appendChild(noRecentNotesMessage); // Voeg toe aan de display
        noRecentNotesMessage.classList.remove('hidden');
    } else {
        recentNotes.forEach(note => {
            const noteItem = createNoteItemElement(note); // Gebruik een helperfunctie
            newNoteDashboardDisplay.appendChild(noteItem);
        });
    }
}

// Render alle notities (alleen notities zonder herinnering)
function renderAllNotes() {
    allNotesDisplay.innerHTML = ''; // Maak de lijst leeg
    noAllNotesMessage.classList.add('hidden'); // Verberg het bericht standaard
    
    // Render filter dropdown voor Alle Notities
    renderFilterTagsDropdown(allNotesFilterTagsContainer, allTags, 'all-notes');


    let filteredNotes = notes.filter(note => !note.reminderDatetime); // Begin met notities zonder herinnering

    if (activeFilterTag) {
        filteredNotes = filteredNotes.filter(note => note.tags && note.tags.includes(activeFilterTag));
    }

    filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sorteer op aanmaakdatum (laatste eerst)

    if (filteredNotes.length === 0) {
        allNotesDisplay.appendChild(noAllNotesMessage); // Voeg toe aan de display
        noAllNotesMessage.classList.remove('hidden');
    } else {
        filteredNotes.forEach(note => {
            const noteItem = createNoteItemElement(note); // Gebruik een helperfunctie
            allNotesDisplay.appendChild(noteItem);
        });
    }
}

// Render alle herinneringen
function renderReminders() {
    remindersListDisplay.innerHTML = ''; // Maak de lijst leeg
    noRemindersMessage.classList.add('hidden'); // Verberg het bericht standaard
    
    // Render filter dropdown voor Herinneringen
    renderFilterTagsDropdown(remindersFilterTagsContainer, allTags, 'reminders');

    let filteredReminders = notes.filter(note => note.reminderDatetime); // Begin met herinneringen

    if (activeFilterTag) {
        filteredReminders = filteredReminders.filter(note => note.tags && note.tags.includes(activeFilterTag));
    }

    filteredReminders.sort((a, b) => {
        const dateA = new Date(a.reminderDatetime);
        const dateB = new Date(b.reminderDatetime);
        const now = new Date();

        const isAPast = dateA < now;
        const isBPast = dateB < now;

        if (isAPast && !isBPast) return 1; // Verlopen komt na toekomst
        if (!isAPast && isBPast) return -1; // Toekomst komt voor verleden

        return dateA - dateB; // Sorteer op datum
    });

    if (filteredReminders.length === 0) {
        remindersListDisplay.appendChild(noRemindersMessage); // Voeg toe aan de display
        noRemindersMessage.classList.remove('hidden');
    } else {
        filteredReminders.forEach(note => {
            const noteItem = createNoteItemElement(note); // Gebruik een helperfunctie
            remindersListDisplay.appendChild(noteItem);
        });
    }
}

// Helperfunctie om een notitie-item HTML-element te creëren
function createNoteItemElement(note) {
    const noteItem = document.createElement('div');
    noteItem.classList.add('note-item', 'flex', 'flex-col', 'gap-1');
    noteItem.dataset.id = note.id;

    let reminderText = '';
    let reminderClass = '';
    if (note.reminderDatetime) {
        const reminderDate = new Date(note.reminderDatetime);
        const now = new Date();

        if (reminderDate < now) {
            reminderText = `<span class="text-gray-400">Verlopen: ${reminderDate.toLocaleString()}</span>`;
            reminderClass = 'reminder-past';
        } else {
            reminderText = `<span class="text-gray-300">Herinnering: ${reminderDate.toLocaleString()}</span>`;
            reminderClass = 'reminder-upcoming';
        }
        noteItem.classList.add(reminderClass);
    }

    // Creëer tag badges
    let tagsHtml = '';
    if (note.tags && note.tags.length > 0) {
        tagsHtml = '<div class="flex flex-wrap mt-2">';
        note.tags.forEach(tag => {
            tagsHtml += `<span class="tag-badge">${tag}</span>`;
        });
        tagsHtml += '</div>';
    }

    // Gebruik innerHTML om de opgemaakte inhoud weer te geven
    noteItem.innerHTML = `
        <h3 class="text-xl font-semibold">${note.title}</h3>
        <div class="text-gray-300 text-sm">${note.content}</div> <!-- Gebruik div voor inhoud -->
        ${tagsHtml} <!-- Voeg tags toe -->
        ${reminderText}
        <div class="note-item-actions">
            <button class="white-round-button edit-button">Bewerken</button>
            <button class="white-round-button delete-button">Verwijderen</button>
        </div>
    `;
    
    // Voeg event listeners toe aan de knoppen
    noteItem.querySelector('.edit-button').addEventListener('click', (event) => {
        event.stopPropagation(); // Voorkom dat klik op item doorgaat
        openFullscreenEditModal(note.id);
    });
    noteItem.querySelector('.delete-button').addEventListener('click', (event) => {
        event.stopPropagation(); // Voorkom dat klik op item doorgaat
        deleteNote(note.id);
    });

    return noteItem;
}

// Render filter tags dropdown
function renderFilterTagsDropdown(container, availableTags, viewType) {
    container.innerHTML = ''; // Leeg de container

    const dropdownHeader = document.createElement('div');
    dropdownHeader.classList.add('filter-tags-dropdown-header');
    dropdownHeader.innerHTML = `
        <span>Filter: ${activeFilterTag || 'Alles'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;
    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('filter-tags-dropdown-content');

    dropdownHeader.addEventListener('click', () => {
        dropdownContent.classList.toggle('open');
    });

    // Voeg "Alles" optie toe
    const allOption = document.createElement('div');
    allOption.classList.add('filter-tags-dropdown-item');
    if (!activeFilterTag) allOption.classList.add('active');
    allOption.textContent = 'Alles';
    allOption.addEventListener('click', () => {
        activeFilterTag = null;
        dropdownContent.classList.remove('open');
        if (viewType === 'all-notes') renderAllNotes();
        else if (viewType === 'reminders') renderReminders();
        dropdownHeader.querySelector('span').textContent = `Filter: Alles`;
    });
    dropdownContent.appendChild(allOption);

    // Voeg unieke tags toe aan de dropdown
    // Gebruik 'allTags' voor de dropdown, zodat je ook op tags kunt filteren die momenteel niet in de gefilterde lijst staan.
    allTags.forEach(tag => { 
        const tagItem = document.createElement('div');
        tagItem.classList.add('filter-tags-dropdown-item');
        if (tag === activeFilterTag) tagItem.classList.add('active');
        tagItem.textContent = tag;
        tagItem.addEventListener('click', () => {
            activeFilterTag = tag;
            dropdownContent.classList.remove('open');
            if (viewType === 'all-notes') renderAllNotes();
            else if (viewType === 'reminders') renderReminders();
            dropdownHeader.querySelector('span').textContent = `Filter: ${tag}`;
        });
        dropdownContent.appendChild(tagItem);
    });

    // Voeg "Tag Toevoegen..." en "Tags Beheren..." opties toe
    const addTagOption = document.createElement('div');
    addTagOption.classList.add('filter-tags-dropdown-item', 'special-action');
    addTagOption.textContent = 'Tag Toevoegen...';
    addTagOption.addEventListener('click', () => {
        dropdownContent.classList.remove('open');
        openSettingsModal();
    });
    dropdownContent.appendChild(addTagOption);
    
    const manageTagsOption = document.createElement('div');
    manageTagsOption.classList.add('filter-tags-dropdown-item', 'special-action');
    manageTagsOption.textContent = 'Tags Beheren...';
    manageTagsOption.addEventListener('click', () => {
        dropdownContent.classList.remove('open');
        openSettingsModal();
    });
    dropdownContent.appendChild(manageTagsOption);


    container.appendChild(dropdownHeader);
    container.appendChild(dropdownContent);

    // Sluit dropdown als er ergens anders op het document wordt geklikt
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target) && dropdownContent.classList.contains('open')) {
            dropdownContent.classList.remove('open');
        }
    });
}


// Render alle notities en herinneringen voor alle weergaven
function renderAllViews() {
    renderNewNoteDashboard();
    renderAllNotes();
    renderReminders();
    renderAllTagsInSettings(); // Render tags in settings modal
}

// Schakel tussen verschillende weergaven (nieuwe notitie/dashboard, alle notities, herinneringen)
function switchView(view) {
    currentView = view;
    activeFilterTag = null; // Reset filter bij het wisselen van tab

    // Update actieve tabbladknop
    tabNewNote.classList.remove('active');
    tabAllNotes.classList.remove('active');
    tabReminders.classList.remove('active');

    // Verberg alle hoofd-display containers
    newNoteDashboardDisplay.classList.add('hidden');
    allNotesViewContainer.classList.add('hidden');
    remindersViewContainer.classList.add('hidden');

    // Toon/verberg het hoofdformulier
    noteForm.classList.add('hidden'); // Verberg het formulier standaard

    // Toon de juiste lijst en pas formulier aan
    switch (currentView) {
        case 'new_note':
            tabNewNote.classList.add('active');
            newNoteDashboardDisplay.classList.remove('hidden');
            noteForm.classList.remove('hidden'); // Toon formulier voor nieuwe notitie
            reminderInputGroup.classList.add('hidden'); // Verberg herinneringsveld
            saveNoteBtn.textContent = 'Notitie Opslaan';
            break;
        case 'all_notes':
            tabAllNotes.classList.add('active');
            allNotesViewContainer.classList.remove('hidden');
            // Formulier blijft verborgen voor deze view
            break;
        case 'reminders':
            tabReminders.classList.add('active');
            remindersViewContainer.classList.remove('hidden');
            noteForm.classList.remove('hidden'); // Toon formulier voor herinnering
            reminderInputGroup.classList.remove('hidden'); // Toon herinneringsveld
            saveNoteBtn.textContent = 'Herinnering Opslaan';
            break;
    }
    resetMainForm(); // Reset hoofdformulier bij het wisselen van weergave
    renderAllViews(); // Zorg ervoor dat de filtertags correct worden weergegeven
}

// Notitie toevoegen of bewerken via het hoofdformulier
saveNoteBtn.addEventListener('click', () => {
    const id = noteIdInput.value;
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.innerHTML.trim(); 
    const tags = parseTags(noteTagsInput.value); // Parsen van tags
    const reminderDatetime = reminderDatetimeInput.value;

    if (!title) {
        logMessage('Titel mag niet leeg zijn.');
        return;
    }

    if (!reminderInputGroup.classList.contains('hidden') && !reminderDatetime) {
        logMessage('Herinneringen vereisen een datum en tijd.');
        return;
    }

    if (id) {
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex > -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
            notes[noteIndex].tags = tags; // Tags opslaan
            const oldReminderDatetime = notes[noteIndex].reminderDatetime;
            notes[noteIndex].reminderDatetime = reminderInputGroup.classList.contains('hidden') ? null : (reminderDatetime || null);

            // Als de herinnering is gewijzigd naar de toekomst, reset notified status
            if (notes[noteIndex].reminderDatetime && oldReminderDatetime && new Date(notes[noteIndex].reminderDatetime) > new Date(oldReminderDatetime) && new Date(notes[noteIndex].reminderDatetime) > new Date()) {
                 notes[noteIndex].notified = false;
            } else if (!notes[noteIndex].reminderDatetime && oldReminderDatetime) {
                // Als herinnering is verwijderd
                notes[noteIndex].notified = false;
            }
        }
        logMessage(`Item succesvol bijgewerkt via hoofdformulier!`);
    } else {
        const newNote = {
            id: crypto.randomUUID(),
            title: title,
            content: content,
            tags: tags, // Tags opslaan
            reminderDatetime: reminderInputGroup.classList.contains('hidden') ? null : (reminderDatetime || null),
            createdAt: new Date().toISOString(),
            notified: false
        };
        notes.push(newNote);
        logMessage(`Item succesvol toegevoegd via hoofdformulier!`);
    }
    // Update allTags array met nieuwe tags
    tags.forEach(tag => {
        if (!allTags.includes(tag)) {
            allTags.push(tag);
        }
    });
    allTags.sort(); // Sorteer de tags
    saveAllTags(); // Sla alle tags op
    saveNotes(); // Sla notities op
    resetMainForm();
    switchView(currentView);
});

// Annuleer bewerken / Reset hoofdformulier
cancelEditBtn.addEventListener('click', () => {
    resetMainForm();
    logMessage('Bewerking geannuleerd of hoofdformulier gereset.');
    switchView(currentView);
});

// Notitie/Herinnering verwijderen via hoofdformulier (indien zichtbaar)
deleteNoteBtn.addEventListener('click', () => {
    const idToDelete = noteIdInput.value;
    if (idToDelete) {
        deleteNote(idToDelete);
        logMessage(`Item succesvol verwijderd via hoofdformulier.`);
    }
});


// Functie om de full-screen bewerkingsmodal te openen
function openFullscreenEditModal(id) {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
        modalNoteIdInput.value = noteToEdit.id;
        modalNoteTitleInput.value = noteToEdit.title;
        modalNoteContentInput.innerHTML = noteToEdit.content; // Vul met HTML-inhoud
        modalNoteContentInput.setAttribute('placeholder', 'Inhoud...'); // Zorg voor placeholder
        modalNoteTagsInput.value = noteToEdit.tags ? noteToEdit.tags.join(', ') : ''; // Vul tags in

        // Herinneringsveld in modal tonen/verbergen en vullen
        if (noteToEdit.reminderDatetime) {
            modalReminderInputGroup.classList.remove('hidden');
            modalReminderDatetimeInput.value = noteToEdit.reminderDatetime.substring(0, 16);
        } else {
            modalReminderInputGroup.classList.add('hidden');
            modalReminderDatetimeInput.value = '';
        }

        // Reset modal toolbar values en update kleurkiezer
        modalColorPicker.value = '#FFFFFF';
        modalColorSwatch.style.backgroundColor = '#FFFFFF';
        modalFontSizeSelect.value = '3';

        // Deactivate modal toolbar buttons
        updateToolbarActiveStates(modalNoteContentInput, modalBoldBtn, modalItalicBtn, modalUnderlineBtn);

        // Toon de modal
        fullscreenEditModal.classList.add('open');
        setTimeout(() => modalNoteContentInput.focus(), 100); 
    }
}

// Functie om de full-screen bewerkingsmodal te sluiten
function closeFullscreenEditModal() {
    fullscreenEditModal.classList.remove('open');
    // Reset de modal velden
    modalNoteIdInput.value = '';
    modalNoteTitleInput.value = '';
    modalNoteContentInput.innerHTML = ''; // Reset inhoud
    modalNoteContentInput.setAttribute('placeholder', 'Inhoud...'); // Reset placeholder
    modalNoteTagsInput.value = ''; // Reset tags input
    modalReminderDatetimeInput.value = '';
    modalReminderInputGroup.classList.add('hidden'); // Verberg het standaard
    modalColorPicker.value = '#FFFFFF'; // Reset kleurkiezer
    modalColorSwatch.style.backgroundColor = '#FFFFFF'; // Reset color swatch
    modalFontSizeSelect.value = '3'; // Reset lettergrootte
}

// Event listener voor opslaan in de modal
modalSaveBtn.addEventListener('click', () => {
    const id = modalNoteIdInput.value;
    const title = modalNoteTitleInput.value.trim();
    const content = modalNoteContentInput.innerHTML.trim();
    const tags = parseTags(modalNoteTagsInput.value); // Parsen van tags
    const reminderDatetime = modalReminderDatetimeInput.value;

    if (!title) {
        logMessage('Titel mag niet leeg zijn in modal.');
        return;
    }

    if (!modalReminderInputGroup.classList.contains('hidden') && !reminderDatetime) {
        logMessage('Herinneringen vereisen een datum en tijd in modal.');
        return;
    }

    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex > -1) {
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        notes[noteIndex].tags = tags; // Tags opslaan
        const oldReminderDatetime = notes[noteIndex].reminderDatetime;
        notes[noteIndex].reminderDatetime = modalReminderInputGroup.classList.contains('hidden') ? null : (reminderDatetime || null);

        if (notes[noteIndex].reminderDatetime && oldReminderDatetime && new Date(notes[noteIndex].reminderDatetime) > new Date(oldReminderDatetime) && new Date(notes[noteIndex].reminderDatetime) > new Date()) {
             notes[noteIndex].notified = false;
        } else if (!notes[noteIndex].reminderDatetime && oldReminderDatetime) {
            notes[noteIndex].notified = false;
        }
    }
    // Update allTags array met nieuwe tags
    tags.forEach(tag => {
        if (!allTags.includes(tag)) {
            allTags.push(tag);
        }
    });
    allTags.sort();
    saveAllTags();
    saveNotes();
    closeFullscreenEditModal();
    logMessage(`Item succesvol bijgewerkt via modal!`);
});

// Event listener voor annuleren in de modal
modalCancelBtn.addEventListener('click', () => {
    closeFullscreenEditModal();
    logMessage('Bewerking geannuleerd in modal.');
});

// Event listener voor verwijderen in de modal
modalDeleteBtn.addEventListener('click', () => {
    const idToDelete = modalNoteIdInput.value;
    if (idToDelete) {
        deleteNote(idToDelete);
        closeFullscreenEditModal();
        logMessage(`Item succesvol verwijderd via modal.`);
    }
});

// Algemene functie om een notitie te verwijderen (gebruikt door hoofdformulier en modal)
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    // Controleren of er tags zijn die nu nergens meer worden gebruikt, en deze verwijderen uit allTags
    updateAllTagsArray();
    saveNotes(); // saveNotes roept nu renderAllViews aan
    resetMainForm(); // Reset ook het hoofdformulier voor het geval de bewerkte notitie daar geladen was
    logMessage(`Item met ID ${id} is verwijderd.`);
}

// Functie om de allTags array te updaten gebaseerd op tags in bestaande notities
function updateAllTagsArray() {
    const uniqueTagsFromNotes = new Set();
    notes.forEach(note => {
        if (note.tags) {
            note.tags.forEach(tag => uniqueTagsFromNotes.add(tag));
        }
    });
    // Zorg ervoor dat allTags alleen tags bevat die daadwerkelijk in notities voorkomen, plus handmatig toegevoegde tags
    allTags = allTags.filter(tag => uniqueTagsFromNotes.has(tag)); // Behoud alleen tags die nog in notities zijn
    allTags.sort();
    saveAllTags();
}


// Hulpmiddel voor text formatting in contenteditable
function formatText(command, value = null) {
    // Bewaar de selectie/cursorpositie
    let selection = window.getSelection();
    let range = null;
    if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
    }

    // Voor fontSize, execCommand werkt met 1-7.
    if (command === 'fontSize' && value) {
        document.execCommand('fontSize', false, value);
    } else {
        document.execCommand(command, false, value);
    }

    // Herstel de selectie/cursorpositie na execCommand
    if (range && selection && selection.rangeCount === 0) {
        selection.removeAllRanges(); // Clear existing ranges to prevent issues
        selection.addRange(range);
    }
    
    // Zorgt ervoor dat de focus teruggaat naar de contenteditable div
    if (document.activeElement === noteContentInput) {
        noteContentInput.focus();
    } else if (document.activeElement === modalNoteContentInput) {
        modalNoteContentInput.focus();
    }
    
    updateToolbarActiveStates(noteContentInput, boldBtn, italicBtn, underlineBtn);
    updateToolbarActiveStates(modalNoteContentInput, modalBoldBtn, modalItalicBtn, modalUnderlineBtn);
}

// Functie om de actieve statussen van toolbar knoppen bij te werken
function updateToolbarActiveStates(contentEditableElement, boldButton, italicButton, underlineButton) {
    if (!contentEditableElement || !contentEditableElement.isContentEditable) return;

    const selection = window.getSelection();
    const isInsideContentEditable = contentEditableElement.contains(selection.anchorNode) || contentEditableElement.contains(selection.focusNode);
    if (!isInsideContentEditable && document.activeElement !== contentEditableElement) {
        if (!contentEditableElement.closest('.editor-container')?.contains(document.activeElement)) {
            if (boldButton) boldButton.classList.remove('active-toolbar-button');
            if (italicButton) italicButton.classList.remove('active-toolbar-button');
            if (underlineButton) underlineButton.classList.remove('active-toolbar-button');
        }
        return;
    }

    if (boldButton) {
        if (document.queryCommandState('bold')) {
            boldButton.classList.add('active-toolbar-button');
        } else {
            boldButton.classList.remove('active-toolbar-button');
        }
    }
    if (italicButton) {
        if (document.queryCommandState('italic')) {
            italicButton.classList.add('active-toolbar-button');
        } else {
            italicButton.classList.remove('active-toolbar-button');
        }
    }
    if (underlineButton) {
        if (document.queryCommandState('underline')) {
            underlineButton.classList.add('active-toolbar-button');
        } else {
            underlineButton.classList.remove('active-toolbar-button');
        }
    }
}

// Functie om contrastkleur te bepalen voor tekst op een gegeven achtergrondkleur
function getContrastColor(hexcolor){
    if (!hexcolor || hexcolor.startsWith('rgba') || hexcolor.startsWith('transparent')) {
        return '#ffffff';
    }
    var r = parseInt(hexcolor.substr(1,2),16);
    var g = parseInt(hexcolor.substr(3,2),16);
    var b = parseInt(hexcolor.substr(5,2),16);
    var y = ((r*299)+(g*587)+(b*114))/1000;
    return (y >= 128) ? '#1a1a1a' : '#ffffff';
}


// Event listeners voor de toolbar knoppen van het hoofdformulier
boldBtn.addEventListener('click', (event) => { event.preventDefault(); formatText('bold'); });
italicBtn.addEventListener('click', (event) => { event.preventDefault(); formatText('italic'); });
underlineBtn.addEventListener('click', (event) => { event.preventDefault(); formatText('underline'); });

colorPicker.addEventListener('input', (event) => {
    event.preventDefault();
    formatText('foreColor', event.target.value);
    mainColorSwatch.style.backgroundColor = event.target.value;
});
fontSizeSelect.addEventListener('change', (event) => { 
    event.preventDefault(); 
    formatText('fontSize', event.target.value); 
});

// Event listeners voor de toolbar knoppen van de modal
modalBoldBtn.addEventListener('click', (event) => { event.preventDefault(); formatText('bold'); });
modalItalicBtn.addEventListener('click', (event) => { event.preventDefault(); formatText('italic'); });
modalUnderlineBtn.addEventListener('click', (event) => { event.preventDefault(); formatText('underline'); });

modalColorPicker.addEventListener('input', (event) => {
    event.preventDefault();
    formatText('foreColor', event.target.value);
    modalColorSwatch.style.backgroundColor = event.target.value;
});
modalFontSizeSelect.addEventListener('change', (event) => { 
    event.preventDefault(); 
    formatText('fontSize', event.target.value); 
});

// Update toolbar statussen wanneer de selectie in de contenteditable div verandert (main form)
noteContentInput.addEventListener('mouseup', () => { updateToolbarActiveStates(noteContentInput, boldBtn, italicBtn, underlineBtn); });
noteContentInput.addEventListener('keyup', () => { updateToolbarActiveStates(noteContentInput, boldBtn, italicBtn, underlineBtn); });
noteContentInput.addEventListener('focus', () => { updateToolbarActiveStates(noteContentInput, boldBtn, italicBtn, underlineBtn); });
noteContentInput.addEventListener('blur', () => { updateToolbarActiveStates(noteContentInput, boldBtn, italicBtn, underlineBtn); });

// Update toolbar statussen wanneer de selectie in de contenteditable div verandert (modal form)
modalNoteContentInput.addEventListener('mouseup', () => { updateToolbarActiveStates(modalNoteContentInput, modalBoldBtn, modalItalicBtn, modalUnderlineBtn); });
modalNoteContentInput.addEventListener('keyup', () => { updateToolbarActiveStates(modalNoteContentInput, modalBoldBtn, modalItalicBtn, modalUnderlineBtn); });
modalNoteContentInput.addEventListener('focus', () => { updateToolbarActiveStates(modalNoteContentInput, modalBoldBtn, modalItalicBtn, modalUnderlineBtn); });
modalNoteContentInput.addEventListener('blur', () => { updateToolbarActiveStates(modalNoteContentInput, modalBoldBtn, modalItalicBtn, modalUnderlineBtn); });


// Functie om de reminder notificatie te tonen
function showReminderNotification(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        notificationTitle.textContent = note.title;
        notificationContent.innerHTML = note.content; 
        reminderNotificationModal.classList.add('open');
        logMessage(`Herinnering gemeld: ${note.title}`);
    }
}

// Event listener voor de sluitknop van de notificatie modal
notificationCloseBtn.addEventListener('click', () => {
    reminderNotificationModal.classList.remove('open');
});

// Functie om herinneringen te controleren die getriggerd moeten worden
function checkReminders() {
    const now = new Date();
    notes.forEach(note => {
        if (note.reminderDatetime && !note.notified) {
            const reminderDate = new Date(note.reminderDatetime);
            if (reminderDate <= now) {
                showReminderNotification(note.id);
                note.notified = true; // Markeer als gemeld
                saveNotes(); // Sla de status op (dit zal renderAllViews triggeren en de UI updaten)
            }
        }
    });
}

// Functie om de settings modal te openen
function openSettingsModal() {
    settingsModal.classList.add('open');
    renderAllTagsInSettings(); // Render de lijst met tags in de settings modal
    newTagInput.focus(); // Focus op het invoerveld voor nieuwe tags
}

// Functie om de settings modal te sluiten
function closeSettingsModal() {
    settingsModal.classList.remove('open');
    newTagInput.value = ''; // Reset het invoerveld
    renderAllViews(); // Zorg ervoor dat de notitielijsten worden bijgewerkt als tags zijn gewijzigd
}

// Render alle tags in de settings modal
function renderAllTagsInSettings() {
    allTagsList.innerHTML = '';
    if (allTags.length === 0) {
        allTagsList.innerHTML = '<p class="text-gray-400">Nog geen tags.</p>';
        return;
    }
    allTags.forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.classList.add('tag-item-settings');
        tagItem.innerHTML = `
            <span>${tag}</span>
            <button class="delete-tag-btn-settings">X</button>
        `;
        tagItem.querySelector('.delete-tag-btn-settings').addEventListener('click', () => {
            deleteTagFromAll(tag);
        });
        allTagsList.appendChild(tagItem);
    });
}

// Tag toevoegen via settings modal
addNewTagBtn.addEventListener('click', () => {
    const newTag = newTagInput.value.trim().toLowerCase();
    if (newTag && !allTags.includes(newTag)) {
        allTags.push(newTag);
        allTags.sort();
        saveAllTags();
        newTagInput.value = '';
        renderAllTagsInSettings(); // Update de lijst in de modal
        logMessage(`Tag '${newTag}' toegevoegd.`);
    } else if (allTags.includes(newTag)) {
        logMessage(`Tag '${newTag}' bestaat al.`);
    } else {
        logMessage(`Voer een geldige tag naam in.`);
    }
});

// Tag verwijderen overal (uit allTags en uit alle notities)
function deleteTagFromAll(tagToDelete) {
    // Verwijder uit allTags array
    allTags = allTags.filter(tag => tag !== tagToDelete);
    saveAllTags();

    // Verwijder de tag uit alle notities
    notes.forEach(note => {
        if (note.tags && note.tags.includes(tagToDelete)) {
            note.tags = note.tags.filter(tag => tag !== tagToDelete);
        }
    });
    saveNotes(); // Dit zal renderAllViews triggeren en de UI bijwerken

    logMessage(`Tag '${tagToDelete}' succesvol verwijderd.`);
    renderAllTagsInSettings(); // Update de lijst in de modal
}


// Initialisatie
document.addEventListener('DOMContentLoaded', () => {
    loadData(); // Laad zowel notities als tags
    
    // Event listeners voor tabbladen
    tabNewNote.addEventListener('click', () => switchView('new_note'));
    tabAllNotes.addEventListener('click', () => switchView('all_notes'));
    tabReminders.addEventListener('click', () => switchView('reminders'));

    // Event listener voor settings icon
    settingsIcon.addEventListener('click', openSettingsModal);
    closeSettingsModalBtn.addEventListener('click', closeSettingsModal);

    // Initialiseer kleurkiezer swatches
    mainColorSwatch.style.backgroundColor = colorPicker.value;
    modalColorSwatch.style.backgroundColor = modalColorPicker.value;

    // Start het periodiek controleren van herinneringen (elke 30 seconden)
    setInterval(checkReminders, 30 * 1000); // 30 seconden
    checkReminders(); // Voer direct een controle uit bij het laden van de pagina
});