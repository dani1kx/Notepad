$(document).ready(function() {
    loadNotes();
    
    $('#addNote').click(function() {
        const title = $('#noteTitle').val().trim();
        const content = $('#noteContent').val().trim();
        
        if (title && content) {
            addNote(title, content);
            $('#noteTitle, #noteContent').val('');
        } else {
            alert('Будь ласка, заповніть заголовок і текст нотатки!');
        }
    });
    
    $('#showAll').click(function() {
        $('.note').show();
    });
    
    $('#showActive').click(function() {
        $('.note').show();
        $('.note.archived').hide();
    });
    
    $('#showArchived').click(function() {
        $('.note').hide();
        $('.note.archived').show();
    });
    
    function addNote(title, content, isArchived = false, date = new Date()) {
        const noteId = Date.now();
        const note = {
            id: noteId,
            title: title,
            content: content,
            date: date,
            isArchived: isArchived
        };
        
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        displayNote(note);
    }
    
    function displayNote(note) {
        const noteElement = $(`
            <div class="note ${note.isArchived ? 'archived' : ''}" data-id="${note.id}">
                <div class="note-title" contenteditable="false">${note.title}</div>
                <div class="note-content" contenteditable="false">${note.content}</div>
                <div class="note-date">Створено: ${new Date(note.date).toLocaleString()}</div>
                <div class="note-actions">
                    <button class="edit-btn">Редагувати</button>
                    <button class="save-btn" style="display: none;">Зберегти</button>
                    <button class="archive-btn">${note.isArchived ? 'Розархівувати' : 'Архівувати'}</button>
                    <button class="delete-btn">Видалити</button>
                </div>
            </div>
        `);
        
        $('#notesList').prepend(noteElement);
        
        noteElement.find('.edit-btn').click(function() {
            toggleEditMode(noteElement);
        });
        
        noteElement.find('.archive-btn').click(function() {
            toggleArchiveNote(noteElement);
        });
        
        noteElement.find('.delete-btn').click(function() {
            deleteNote(noteElement);
        });
        
        
        noteElement.find('.save-btn').click(function() {
            saveNoteChanges(noteElement);
        });
        
        
        noteElement.on('keydown', '.note-title, .note-content', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveNoteChanges(noteElement);
            }
        });
    }
    
    function toggleEditMode(noteElement) {
        const wasEditing = noteElement.hasClass('editing');
        
        if (wasEditing) {
            
            noteElement.removeClass('editing');
            noteElement.find('.note-title, .note-content').attr('contenteditable', false);
            
            noteElement.find('.edit-btn').show();
            noteElement.find('.save-btn').hide();
        } else {
            
            noteElement.addClass('editing');
            noteElement.find('.note-title, .note-content').attr('contenteditable', true);
            
            noteElement.find('.edit-btn').hide();
            noteElement.find('.save-btn').show();
            noteElement.find('.note-title').focus();
        }
    }
    
    function toggleArchiveNote(noteElement) {
        const noteId = noteElement.data('id');
        let notes = JSON.parse(localStorage.getItem('notes'));
        
        const noteIndex = notes.findIndex(note => note.id == noteId);
        if (noteIndex !== -1) {
            notes[noteIndex].isArchived = !notes[noteIndex].isArchived;
            localStorage.setItem('notes', JSON.stringify(notes));
            
            noteElement.toggleClass('archived');
            noteElement.find('.archive-btn').text(notes[noteIndex].isArchived ? 'Розархівувати' : 'Архівувати');
        }
    }
    
    function deleteNote(noteElement) {
        if (confirm('Ви впевнені, що хочете видалити цю нотатку???')) {
            const noteId = noteElement.data('id');
            let notes = JSON.parse(localStorage.getItem('notes'));
            
            notes = notes.filter(note => note.id != noteId);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            noteElement.remove();
        }
    }
    
    function saveNoteChanges(noteElement) {
        const noteId = noteElement.data('id');
        let notes = JSON.parse(localStorage.getItem('notes'));
        
        const noteIndex = notes.findIndex(note => note.id == noteId);
        if (noteIndex !== -1) {
            const newTitle = noteElement.find('.note-title').text();
            const newContent = noteElement.find('.note-content').text();
            
            
            if (notes[noteIndex].title !== newTitle || notes[noteIndex].content !== newContent) {
                notes[noteIndex].title = newTitle;
                notes[noteIndex].content = newContent;
                notes[noteIndex].date = new Date();
                
                localStorage.setItem('notes', JSON.stringify(notes));
                noteElement.find('.note-date').text(`Оновлено: ${new Date(notes[noteIndex].date).toLocaleString()}`);
            }
            
            
            noteElement.removeClass('editing');
            noteElement.find('.note-title, .note-content').attr('contenteditable', false);
            
            
            noteElement.find('.edit-btn').show();
            noteElement.find('.save-btn').hide();
        }
    }
    
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        $('#notesList').empty();
        
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        notes.forEach(note => {
            displayNote(note);
        });
    }
});
