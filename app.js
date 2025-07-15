/**
 * Gestor de Entradas de Texto con Navegación por Pantallas
 * Maneja la creación, visualización y almacenamiento de entradas de texto
 */
class TextEntryManager {
    constructor() {
        this.entries = this.loadEntries();
        this.currentScreen = 'editor';
        this.searchTerm = '';
        this.editingEntryId = null; // Para saber si estamos editando
        this.initializeElements();
        this.attachEventListeners();
        this.initializeTheme();
        this.updateUI();
    }

    /**
     * Inicializa las referencias a elementos del DOM
     */
    initializeElements() {
        // Navegación
        this.btnEditor = document.getElementById('btnEditor');
        this.btnEntries = document.getElementById('btnEntries');
        this.entriesCount = document.getElementById('entriesCount');
        
        // Selector de tema
        this.btnTheme = document.getElementById('btnTheme');
        this.themeMenu = document.getElementById('themeMenu');
        this.themeOptions = document.querySelectorAll('.theme-option');
        
        console.log('Theme elements found:', {
            btnTheme: !!this.btnTheme,
            themeMenu: !!this.themeMenu,
            themeOptionsCount: this.themeOptions.length
        });
        
        // Pantallas
        this.editorScreen = document.getElementById('editorScreen');
        this.entriesScreen = document.getElementById('entriesScreen');
        
        // Formulario
        this.form = document.getElementById('entryForm');
        this.titleInput = document.getElementById('title');
        this.messageInput = document.getElementById('message');
        this.titleCounter = document.getElementById('titleCounter');
        this.messageCounter = document.getElementById('messageCounter');
        this.btnClear = document.getElementById('btnClear');
        
        // Entradas
        this.entriesContainer = document.getElementById('entries');
        this.totalEntries = document.getElementById('totalEntries');
        
        // Búsqueda
        this.btnSearch = document.getElementById('btnSearch');
        this.searchContainer = document.getElementById('searchContainer');
        this.searchInput = document.getElementById('searchInput');
        this.btnCloseSearch = document.getElementById('btnCloseSearch');
        
        // Botón crear primera entrada
        this.btnCreateFirst = document.getElementById('btnCreateFirst');

        this.validateElements();
    }

    /**
     * Valida que todos los elementos requeridos estén presentes
     */
    validateElements() {
        const requiredElements = [
            'btnEditor', 'btnEntries', 'editorScreen', 'entriesScreen',
            'form', 'titleInput', 'messageInput', 'entriesContainer'
        ];
        
        for (const elementName of requiredElements) {
            if (!this[elementName]) {
                throw new Error(`Elemento requerido no encontrado: ${elementName}`);
            }
        }
    }

    /**
     * Adjunta los event listeners necesarios
     */
    attachEventListeners() {
        // Navegación
        this.btnEditor.addEventListener('click', () => this.showScreen('editor'));
        this.btnEntries.addEventListener('click', () => this.showScreen('entries'));
        
        // Selector de tema
        this.btnTheme?.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Theme button clicked');
            this.toggleThemeMenu();
        });
        this.themeOptions?.forEach((option, index) => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const theme = e.currentTarget.dataset.theme;
                console.log(`Theme option clicked: ${theme}`);
                this.changeTheme(theme);
            });
        });
        
        // Cerrar menú de tema al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.btnTheme?.contains(e.target) && !this.themeMenu?.contains(e.target)) {
                this.closeThemeMenu();
            }
        });
        
        // Formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.btnClear?.addEventListener('click', () => this.clearForm());
        
        // Contadores de caracteres
        this.titleInput.addEventListener('input', () => {
            this.updateCharCounter('title');
            this.validateForm();
        });
        this.messageInput.addEventListener('input', () => {
            this.updateCharCounter('message');
            this.validateForm();
        });
        
        // Búsqueda
        this.btnSearch?.addEventListener('click', () => this.toggleSearch());
        this.btnCloseSearch?.addEventListener('click', () => this.closeSearch());
        this.searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Crear primera entrada
        this.btnCreateFirst?.addEventListener('click', () => this.showScreen('editor'));
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Métodos de gestión de tema
    toggleThemeMenu() {
        console.log('Toggling theme menu');
        const isVisible = this.themeMenu?.classList.contains('show');
        if (isVisible) {
            this.themeMenu?.classList.remove('show');
        } else {
            this.themeMenu?.classList.add('show');
        }
    }
    
    closeThemeMenu() {
        this.themeMenu?.classList.remove('show');
    }
    
    changeTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);
        this.updateThemeButton(theme);
        this.closeThemeMenu();
        
        console.log(`Theme changed to: ${theme}`);
    }
    
    updateThemeButton(theme) {
        const themeNames = {
            'light': '☀️ Claro',
            'dark': '🌙 Oscuro',
            'auto': '🔄 Automático'
        };
        
        if (this.btnTheme) {
            this.btnTheme.querySelector('span').textContent = themeNames[theme] || themeNames['auto'];
        }
        
        // Actualizar opciones activas
        this.themeOptions?.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            }
        });
    }
    
    applyAutoTheme() {
        // No necesitamos hacer nada especial aquí porque CSS maneja automáticamente
        // el tema con @media (prefers-color-scheme: dark)
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('preferred-theme') || 'auto';
        this.changeTheme(savedTheme);
        
        // Escuchar cambios en preferencias del sistema para modo automático
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (document.documentElement.getAttribute('data-theme') === 'auto') {
                // El CSS se encarga automáticamente del cambio
                console.log('System theme preference changed');
            }
        });
    }

    /**
     * Maneja los atajos de teclado
     */
    handleKeyboard(e) {
        // Alt + 1: Ir al editor
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            this.showScreen('editor');
        }
        
        // Alt + 2: Ir a entradas
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            this.showScreen('entries');
        }
        
        // Ctrl + / o Cmd + /: Toggle búsqueda (solo en pantalla de entradas)
        if ((e.ctrlKey || e.metaKey) && e.key === '/' && this.currentScreen === 'entries') {
            e.preventDefault();
            this.toggleSearch();
        }
        
        // Escape: Cerrar búsqueda
        if (e.key === 'Escape' && !this.searchContainer?.classList.contains('hidden')) {
            this.closeSearch();
        }
    }

    /**
     * Cambia entre pantallas
     */
    showScreen(screenName) {
        // Actualizar estado
        this.currentScreen = screenName;
        
        // Actualizar navegación
        this.btnEditor.classList.toggle('active', screenName === 'editor');
        this.btnEntries.classList.toggle('active', screenName === 'entries');
        
        // Actualizar pantallas
        this.editorScreen.classList.toggle('active', screenName === 'editor');
        this.entriesScreen.classList.toggle('active', screenName === 'entries');
        
        // Acciones específicas por pantalla
        if (screenName === 'editor') {
            // Enfocar el primer campo
            setTimeout(() => this.titleInput.focus(), 100);
            this.closeSearch();
        } else if (screenName === 'entries') {
            // Actualizar la vista de entradas
            this.renderEntries();
        }
        
        console.log(`Cambiado a pantalla: ${screenName}`);
    }

    /**
     * Actualiza los contadores de caracteres
     */
    updateCharCounter(fieldName) {
        const input = fieldName === 'title' ? this.titleInput : this.messageInput;
        const counter = fieldName === 'title' ? this.titleCounter : this.messageCounter;
        const maxLength = fieldName === 'title' ? 100 : 1000;
        
        if (counter) {
            const currentLength = input.value.length;
            counter.textContent = currentLength;
            
            // Cambiar color según proximidad al límite
            if (currentLength > maxLength * 0.9) {
                counter.style.color = 'var(--danger-color)';
            } else if (currentLength > maxLength * 0.7) {
                counter.style.color = 'var(--primary-color)';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
        }
    }

    /**
     * Limpia el formulario
     */
    clearForm() {
        this.form.reset();
        this.updateCharCounter('title');
        this.updateCharCounter('message');
        this.validateForm();
        this.titleInput.focus();
        this.showMessage('Formulario limpiado', 'info');
    }

    /**
     * Toggle del sistema de búsqueda
     */
    toggleSearch() {
        const isHidden = this.searchContainer?.classList.contains('hidden');
        
        if (isHidden) {
            this.searchContainer.classList.remove('hidden');
            this.searchInput.focus();
        } else {
            this.closeSearch();
        }
    }

    /**
     * Cierra la búsqueda
     */
    closeSearch() {
        if (this.searchContainer) {
            this.searchContainer.classList.add('hidden');
            this.searchInput.value = '';
            this.searchTerm = '';
            this.renderEntries();
        }
    }

    /**
     * Maneja la búsqueda en tiempo real
     */
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        this.renderEntries();
    }

    /**
     * Filtra entradas según el término de búsqueda
     */
    getFilteredEntries() {
        if (!this.searchTerm) return this.entries;
        
        return this.entries.filter(entry => 
            entry.title.toLowerCase().includes(this.searchTerm) ||
            entry.message.toLowerCase().includes(this.searchTerm)
        );
    }

    /**
     * Actualiza toda la interfaz
     */
    updateUI() {
        this.updateNavigationCounts();
        this.updateEntriesStats();
        this.renderEntries();
        this.validateForm();
        this.updateCharCounter('title');
        this.updateCharCounter('message');
    }

    /**
     * Actualiza los contadores en la navegación
     */
    updateNavigationCounts() {
        if (this.entriesCount) {
            this.entriesCount.textContent = this.entries.length;
        }
    }

    /**
     * Actualiza las estadísticas de entradas
     */
    updateEntriesStats() {
        if (this.totalEntries) {
            const count = this.entries.length;
            this.totalEntries.textContent = count === 0 ? 'Sin entradas' :
                count === 1 ? '1 entrada' : `${count} entradas`;
        }
    }

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento de envío del formulario
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const title = this.titleInput.value.trim();
        const message = this.messageInput.value.trim();
        
        if (this.validateEntry(title, message)) {
            if (this.editingEntryId) {
                // Modo edición
                this.updateEntry(this.editingEntryId, title, message);
            } else {
                // Modo creación
                this.addEntry(title, message);
                this.resetForm();
                this.showSuccessMessage('Entrada creada exitosamente');
                
                // Cambiar automáticamente a la pantalla de entradas
                setTimeout(() => this.showScreen('entries'), 1000);
            }
        }
    }

    /**
     * Valida una entrada antes de agregarla
     * @param {string} title - Título de la entrada
     * @param {string} message - Mensaje de la entrada
     * @returns {boolean} - True si la entrada es válida
     */
    validateEntry(title, message) {
        if (!title || !message) {
            this.showErrorMessage('Por favor, completa todos los campos');
            return false;
        }

        if (title.length > 100) {
            this.showErrorMessage('El título no puede tener más de 100 caracteres');
            return false;
        }

        if (message.length > 1000) {
            this.showErrorMessage('El mensaje no puede tener más de 1000 caracteres');
            return false;
        }

        return true;
    }

    /**
     * Valida el formulario en tiempo real
     */
    validateForm() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const title = this.titleInput.value.trim();
        const message = this.messageInput.value.trim();
        
        if (submitButton) {
            submitButton.disabled = !title || !message;
        }
    }

    /**
     * Agrega una nueva entrada
     * @param {string} title - Título de la entrada
     * @param {string} message - Mensaje de la entrada
     */
    addEntry(title, message) {
        const entry = {
            id: this.generateId(),
            title,
            message,
            date: this.formatDate(new Date()),
            createdAt: Date.now()
        };
        
        this.entries.unshift(entry);
        this.saveEntries();
        this.updateUI();
    }

    /**
     * Genera un ID único para la entrada
     * @returns {string} - ID único
     */
    generateId() {
        return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Formatea una fecha para mostrar
     * @param {Date} date - Fecha a formatear
     * @returns {string} - Fecha formateada
     */
    formatDate(date) {
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Renderiza todas las entradas en el DOM
     */
    renderEntries() {
        const filteredEntries = this.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            this.renderNoEntries();
            return;
        }
        
        this.entriesContainer.innerHTML = filteredEntries
            .map(entry => this.renderEntry(entry))
            .join('');
    }

    /**
     * Renderiza una entrada individual
     * @param {Object} entry - Entrada a renderizar
     * @returns {string} - HTML de la entrada
     */
    renderEntry(entry) {
        return `
            <article class="entry" data-id="${entry.id}">
                <div class="entry-header">
                    <header class="entry-title">${this.escapeHtml(entry.title)}</header>
                    <div class="entry-actions">
                        <button class="btn-action btn-edit" onclick="window.textEntryApp.editEntry('${entry.id}')" title="Editar">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.textEntryApp.confirmDeleteEntry('${entry.id}')" title="Eliminar">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </div>
                <div class="entry-message">${this.escapeHtml(entry.message)}</div>
                <footer class="entry-date">
                    <span>Creado el: ${entry.date}</span>
                    ${entry.lastModified ? `<span class="modified-date">Editado: ${entry.lastModified}</span>` : ''}
                </footer>
            </article>
        `;
    }

    /**
     * Renderiza el mensaje cuando no hay entradas
     */
    renderNoEntries() {
        const isSearching = this.searchTerm;
        
        if (isSearching) {
            this.entriesContainer.innerHTML = `
                <div class="no-entries">
                    <div class="empty-state">
                        <span class="empty-icon">🔍</span>
                        <h3>Sin resultados</h3>
                        <p>No se encontraron entradas que coincidan con "<strong>${this.escapeHtml(this.searchTerm)}</strong>"</p>
                        <button onclick="window.textEntryApp.closeSearch()" class="btn-secondary">
                            <span class="btn-icon">✖️</span>
                            Limpiar búsqueda
                        </button>
                    </div>
                </div>
            `;
        } else {
            this.entriesContainer.innerHTML = `
                <div class="no-entries">
                    <div class="empty-state">
                        <span class="empty-icon">📝</span>
                        <h3>No hay entradas todavía</h3>
                        <p>¡Crea tu primera entrada para comenzar!</p>
                        <button id="btnCreateFirst" class="btn-primary">
                            <span class="btn-icon">✏️</span>
                            Crear Primera Entrada
                        </button>
                    </div>
                </div>
            `;
            
            // Re-adjuntar el event listener al botón dinámico
            const newBtnCreateFirst = document.getElementById('btnCreateFirst');
            if (newBtnCreateFirst) {
                newBtnCreateFirst.addEventListener('click', () => this.showScreen('editor'));
            }
        }
    }

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Resetea el formulario después de enviar
     */
    resetForm() {
        this.form.reset();
        this.validateForm();
        this.updateCharCounter('title');
        this.updateCharCounter('message');
        this.titleInput.focus();
    }

    /**
     * Muestra un mensaje de éxito
     */
    showSuccessMessage(message = 'Entrada creada exitosamente') {
        this.showMessage(message, 'success');
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Muestra un mensaje temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, info)
     */
    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${colors[type] || colors.info};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(messageElement)) {
                    document.body.removeChild(messageElement);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Guarda las entradas en localStorage
     */
    saveEntries() {
        try {
            localStorage.setItem('textEntries', JSON.stringify(this.entries));
        } catch (error) {
            console.error('Error al guardar entradas:', error);
            this.showErrorMessage('Error al guardar la entrada');
        }
    }

    /**
     * Carga las entradas desde localStorage
     * @returns {Array} - Array de entradas
     */
    loadEntries() {
        try {
            const saved = localStorage.getItem('textEntries');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error al cargar entradas:', error);
            return [];
        }
    }

    /**
     * Obtiene estadísticas de las entradas
     * @returns {Object} - Objeto con estadísticas
     */
    getStats() {
        return {
            totalEntries: this.entries.length,
            totalCharacters: this.entries.reduce((sum, entry) => 
                sum + entry.title.length + entry.message.length, 0),
            oldestEntry: this.entries.length > 0 ? 
                Math.min(...this.entries.map(e => e.createdAt)) : null,
            newestEntry: this.entries.length > 0 ? 
                Math.max(...this.entries.map(e => e.createdAt)) : null,
            currentScreen: this.currentScreen,
            searchActive: !!this.searchTerm
        };
    }

    // ==================== MÉTODOS CRUD ====================

    /**
     * Edita una entrada existente
     * @param {string} entryId - ID de la entrada a editar
     */
    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) {
            this.showErrorMessage('Entrada no encontrada');
            return;
        }

        // Cambiar a modo edición
        this.editingEntryId = entryId;
        this.populateForm(entry);
        this.showScreen('editor');
        this.updateEditorUI(true);
        
        this.showMessage('Modo edición activado', 'info');
    }

    /**
     * Llena el formulario con los datos de una entrada
     * @param {Object} entry - Entrada a cargar en el formulario
     */
    populateForm(entry) {
        this.titleInput.value = entry.title;
        this.messageInput.value = entry.message;
        this.updateCharCounter('title');
        this.updateCharCounter('message');
        this.validateForm();
    }

    /**
     * Actualiza la UI del editor según el modo (crear/editar)
     * @param {boolean} isEditing - Si está en modo edición
     */
    updateEditorUI(isEditing) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const screenHeader = this.editorScreen.querySelector('.screen-header h2');
        const screenSubtitle = this.editorScreen.querySelector('.screen-subtitle');
        
        if (isEditing) {
            submitBtn.innerHTML = '<span class="btn-icon">💾</span>Actualizar Entrada';
            screenHeader.textContent = 'Editar Entrada';
            screenSubtitle.textContent = 'Modifica tu entrada existente';
            
            // Agregar botón cancelar si no existe
            if (!document.getElementById('btnCancelEdit')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.type = 'button';
                cancelBtn.id = 'btnCancelEdit';
                cancelBtn.className = 'btn-secondary';
                cancelBtn.innerHTML = '<span class="btn-icon">❌</span>Cancelar';
                cancelBtn.addEventListener('click', () => this.cancelEdit());
                
                const formActions = this.form.querySelector('.form-actions');
                formActions.appendChild(cancelBtn);
            }
        } else {
            submitBtn.innerHTML = '<span class="btn-icon">💾</span>Crear Entrada';
            screenHeader.textContent = 'Crear Nueva Entrada';
            screenSubtitle.textContent = 'Comparte tus ideas y pensamientos';
            
            // Remover botón cancelar
            const cancelBtn = document.getElementById('btnCancelEdit');
            if (cancelBtn) {
                cancelBtn.remove();
            }
        }
    }

    /**
     * Cancela la edición y vuelve al modo crear
     */
    cancelEdit() {
        this.editingEntryId = null;
        this.resetForm();
        this.updateEditorUI(false);
        this.showMessage('Edición cancelada', 'info');
    }

    /**
     * Actualiza una entrada existente
     * @param {string} entryId - ID de la entrada
     * @param {string} title - Nuevo título
     * @param {string} message - Nuevo mensaje
     */
    updateEntry(entryId, title, message) {
        const entryIndex = this.entries.findIndex(e => e.id === entryId);
        if (entryIndex === -1) {
            this.showErrorMessage('Entrada no encontrada');
            return false;
        }

        // Actualizar entrada
        this.entries[entryIndex] = {
            ...this.entries[entryIndex],
            title,
            message,
            lastModified: this.formatDate(new Date())
        };

        this.saveEntries();
        this.updateUI();
        
        // Resetear modo edición
        this.editingEntryId = null;
        this.updateEditorUI(false);
        
        this.showSuccessMessage('Entrada actualizada exitosamente');
        
        // Cambiar a pantalla de entradas
        setTimeout(() => this.showScreen('entries'), 1000);
        
        return true;
    }

    /**
     * Confirma la eliminación de una entrada
     * @param {string} entryId - ID de la entrada a eliminar
     */
    confirmDeleteEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) {
            this.showErrorMessage('Entrada no encontrada');
            return;
        }

        // Crear modal de confirmación
        this.showDeleteConfirmation(entry);
    }

    /**
     * Muestra un modal de confirmación para eliminar
     * @param {Object} entry - Entrada a eliminar
     */
    showDeleteConfirmation(entry) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmar Eliminación</h3>
                </div>
                <div class="modal-body">
                    <p>¿Estás seguro de que quieres eliminar esta entrada?</p>
                    <div class="entry-preview">
                        <strong>${this.escapeHtml(entry.title)}</strong>
                        <p>${this.escapeHtml(entry.message.substring(0, 100))}${entry.message.length > 100 ? '...' : ''}</p>
                    </div>
                    <p class="warning-text">Esta acción no se puede deshacer.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="window.textEntryApp.closeDeleteModal()">
                        <span class="btn-icon">❌</span>
                        Cancelar
                    </button>
                    <button class="btn-danger" onclick="window.textEntryApp.deleteEntry('${entry.id}')">
                        <span class="btn-icon">🗑️</span>
                        Eliminar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDeleteModal();
            }
        });
        
        // Cerrar con Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeDeleteModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Cierra el modal de confirmación de eliminación
     */
    closeDeleteModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Elimina una entrada
     * @param {string} entryId - ID de la entrada a eliminar
     */
    deleteEntry(entryId) {
        const entryIndex = this.entries.findIndex(e => e.id === entryId);
        if (entryIndex === -1) {
            this.showErrorMessage('Entrada no encontrada');
            return false;
        }

        // Guardar referencia para posible deshacer
        const deletedEntry = this.entries[entryIndex];
        
        // Eliminar entrada
        this.entries.splice(entryIndex, 1);
        this.saveEntries();
        this.updateUI();
        this.closeDeleteModal();
        
        // Mostrar mensaje con opción de deshacer
        this.showDeleteSuccessWithUndo(deletedEntry, entryIndex);
        
        return true;
    }

    /**
     * Muestra mensaje de éxito con opción de deshacer
     * @param {Object} deletedEntry - Entrada eliminada
     * @param {number} originalIndex - Índice original de la entrada
     */
    showDeleteSuccessWithUndo(deletedEntry, originalIndex) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-success message-with-action';
        messageElement.innerHTML = `
            <div class="message-content">
                <span>Entrada eliminada exitosamente</span>
                <button class="btn-undo" onclick="window.textEntryApp.undoDelete('${deletedEntry.id}', ${originalIndex})">
                    <span class="btn-icon">↶</span>
                    Deshacer
                </button>
            </div>
        `;
        
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: #28a745;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 300px;
        `;

        document.body.appendChild(messageElement);

        // Auto-remover después de 8 segundos
        setTimeout(() => {
            if (document.body.contains(messageElement)) {
                messageElement.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    if (document.body.contains(messageElement)) {
                        document.body.removeChild(messageElement);
                    }
                }, 300);
            }
        }, 8000);
        
        // Guardar para deshacer
        this.deletedEntry = { entry: deletedEntry, index: originalIndex };
    }

    /**
     * Deshace la eliminación de una entrada
     * @param {string} entryId - ID de la entrada eliminada
     * @param {number} originalIndex - Índice original
     */
    undoDelete(entryId, originalIndex) {
        if (this.deletedEntry && this.deletedEntry.entry.id === entryId) {
            // Restaurar entrada en su posición original
            this.entries.splice(originalIndex, 0, this.deletedEntry.entry);
            this.saveEntries();
            this.updateUI();
            
            // Limpiar referencia
            this.deletedEntry = null;
            
            // Remover mensaje
            const messageElement = document.querySelector('.message-with-action');
            if (messageElement) {
                messageElement.remove();
            }
            
            this.showMessage('Entrada restaurada exitosamente', 'success');
        }
    }

    /**
     * Busca una entrada por ID
     * @param {string} entryId - ID de la entrada
     * @returns {Object|null} - Entrada encontrada o null
     */
    findEntryById(entryId) {
        return this.entries.find(entry => entry.id === entryId) || null;
    }

    /**
     * Duplica una entrada
     * @param {string} entryId - ID de la entrada a duplicar
     */
    duplicateEntry(entryId) {
        const entry = this.findEntryById(entryId);
        if (!entry) {
            this.showErrorMessage('Entrada no encontrada');
            return;
        }

        const duplicatedEntry = {
            id: this.generateId(),
            title: `${entry.title} (Copia)`,
            message: entry.message,
            date: this.formatDate(new Date()),
            createdAt: Date.now()
        };

        this.entries.unshift(duplicatedEntry);
        this.saveEntries();
        this.updateUI();
        
        this.showMessage('Entrada duplicada exitosamente', 'success');
    }
}

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Agregar estilos para las animaciones
        const styles = document.createElement('style');
        styles.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .message {
                font-family: 'Segoe UI', Tahoma, Verdana, Arial, sans-serif;
            }
        `;
        document.head.appendChild(styles);

        // Inicializar la aplicación
        const app = new TextEntryManager();
        
        // Hacer la instancia accesible globalmente para debugging
        window.textEntryApp = app;
        
        console.log('Aplicación de entradas de texto inicializada correctamente');
        console.log('Atajos de teclado disponibles:');
        console.log('- Alt + 1: Ir al editor');
        console.log('- Alt + 2: Ir a entradas');
        console.log('- Ctrl/Cmd + /: Toggle búsqueda (en pantalla de entradas)');
        console.log('- Escape: Cerrar búsqueda');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});
