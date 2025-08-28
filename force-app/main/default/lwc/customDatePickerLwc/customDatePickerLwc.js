import { LightningElement, api, track } from 'lwc';
import firstDayOfWeek from '@salesforce/i18n/firstDayOfWeek';
import locale from '@salesforce/i18n/locale';

const DATE_FORMAT = 'MM/DD/YYYY';

export default class CustomDatePickerLwc extends LightningElement {
    @api label = "";
    @api placeholder = "";
    @api styleClass = "";
    @api min = ""; // format YYYY-MM-DD
    @api showTodayHyperlink = false;
    @api extendedYearRange = false;
    @api startYear = 0;
    @api finishYear = 0;
    @api dayToSelect = 0; // 0 for Sunday, 1 for Monday, etc.

    @track value = '';
    @track _placeholder = DATE_FORMAT;
    @track years = [];
    @track monthName = '';
    @track dayGrid = [];
    @track _error = false;
    @track errorMessage = "";
    
    _open = false;
    _over = false;
    _isInputClicked = false; // Flag to handle the first click
    _selectedDate = null;
    _minDate = null;
    _currentDateInView = new Date();
    _namesOfWeekdays = [];

    connectedCallback() {
        this._placeholder = this.placeholder || DATE_FORMAT;
        this.dayToSelect = parseInt(this.dayToSelect, 10);
        this.setInitialDate();
        this.setupWeekdayNames();
    }

    setInitialDate() {
        if (this.value) {
            this._selectedDate = this.parseDate(this.value);
        }
        if (this.min) {
            this._minDate = this.parseDate(this.min);
        }
        this._currentDateInView = this._selectedDate || this._minDate || new Date();
    }

    setupWeekdayNames() {
        const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const shorthandNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        this._namesOfWeekdays = names.map((name, index) => ({
            key: `day-${index}`,
            longName: name,
            shortName: shorthandNames[index],
            index: index
        }));

        this.reorderWeekdays();
    }

    reorderWeekdays() {
        let firstDay = parseInt(firstDayOfWeek, 10);
        if (firstDay > 6 || firstDay < 0) {
            firstDay = 0;
        }
        const reorderedDays = [...this._namesOfWeekdays.slice(firstDay), ...this._namesOfWeekdays.slice(0, firstDay)];
        this._namesOfWeekdays = reorderedDays;
    }

    handleInputFocus() {
        if (this._open) return;
        this.openDropdown();
        this.initialize();
    }

    handleDropdownClick(event) {
        event.stopPropagation();
    }

    handleMouseOver() { this._over = true; }
    handleMouseOut() { this._over = false; }
    
    handleClearDate() {
        this.value = '';
        this._selectedDate = null;
        this.errorMessage = '';
        this._error = false;
        this.dispatchEvent(new CustomEvent('datechange', { detail: { value: '' } }));
    }

    handleYearChange(event) {
        this._currentDateInView.setFullYear(event.target.value);
        this.initialize();
    }

    goToPreviousMonth() {
        this._currentDateInView.setMonth(this._currentDateInView.getMonth() - 1);
        this.initialize();
    }

    goToNextMonth() {
        this._currentDateInView.setMonth(this._currentDateInView.getMonth() + 1);
        this.initialize();
    }
    
    goToToday() {
        this._selectedDate = new Date();
        this._currentDateInView = new Date();
        this.value = this.formatDate(this._selectedDate);
        this.closeDropdown();
        this.dispatchEvent(new CustomEvent('datechange', { detail: { value: this.value } }));
    }

    handleTableCellClick(event) {
        const selectedDateStr = event.currentTarget.dataset.fullDate;
        if (selectedDateStr) {
            this._selectedDate = new Date(selectedDateStr);
            this.value = this.formatDate(this._selectedDate);
            this.closeDropdown();
            this.dispatchEvent(new CustomEvent('datechange', { detail: { value: this.value } }));
        }
    }
    
    initialize() {
        this.monthName = this._currentDateInView.toLocaleString(locale, { month: 'long' });
        this.generateYearOptions();
        this.generateMonthGrid();
        this.validateDate();
    }

    validateDate() {
        if (this._minDate && this._selectedDate && this._selectedDate.getTime() < this._minDate.getTime()) {
            this._error = true;
            this.errorMessage = `Date cannot be before ${this.formatDate(this._minDate)}`;
        } else {
            this._error = false;
            this.errorMessage = '';
        }
    }

    generateYearOptions() {
        this.years = [];
        const currentYear = this._currentDateInView.getFullYear();
        let startYear = this.extendedYearRange && this.startYear ? this.startYear : currentYear - 5;
        let finishYear = this.extendedYearRange && this.finishYear ? this.finishYear : currentYear + 5;

        for (let i = startYear; i <= finishYear; i++) {
            this.years.push({
                label: i,
                value: i,
                selected: i === currentYear
            });
        }
    }

    generateMonthGrid() {
        this.dayGrid = [];
        const firstDayOfMonth = new Date(this._currentDateInView.getFullYear(), this._currentDateInView.getMonth(), 1);
        const dayOfWeekOfFirstDay = firstDayOfMonth.getDay();
        let localFirstDayOfWeek = parseInt(firstDayOfWeek, 10) - 1;
        if (localFirstDayOfWeek < 0) localFirstDayOfWeek = 6;
        
        let day = new Date(firstDayOfMonth);
        day.setDate(day.getDate() - (dayOfWeekOfFirstDay - localFirstDayOfWeek + 7) % 7);

        for (let week = 0; week < 6; week++) {
            let days = [];
            for (let i = 0; i < 7; i++) {
                const fullDate = new Date(day);
                const isCurrentMonth = fullDate.getMonth() === this._currentDateInView.getMonth();
                const isSelected = this._selectedDate && fullDate.toDateString() === this._selectedDate.toDateString();
                const isToday = fullDate.toDateString() === new Date().toDateString();
                const isDisabled = this._minDate && fullDate.getTime() < this._minDate.getTime();
                const isSelectableDay = this.dayToSelect === -1 || fullDate.getDay() === this.dayToSelect;

                let tdClass = `slds-day_cell`;
                let ariaSelected = isSelected ? 'true' : 'false';
                let ariaDisabled = 'false';

                if (!isCurrentMonth) {
                    tdClass += ' slds-is-outside-current-month';
                }
                if (isSelected) {
                    tdClass += ' slds-is-selected';
                }
                if (isToday) {
                    tdClass += ' slds-is-today';
                }
                if (isDisabled || !isSelectableDay) {
                    tdClass += ' slds-disabled-text unselectable';
                    ariaDisabled = 'true';
                }
                if (isSelectableDay && !isDisabled && !isSelected && isCurrentMonth) {
                    tdClass += ' selectable';
                }

                days.push({
                    key: `cell-${week}-${i}`,
                    label: fullDate.getDate(),
                    tdClass: tdClass,
                    value: this.formatDate(fullDate, 'YYYY-MM-DD'),
                    ariaSelected: ariaSelected,
                    ariaDisabled: ariaDisabled
                });
                day.setDate(day.getDate() + 1);
            }
            this.dayGrid.push({ weekKey: `week-${week}`, days });
        }
    }

    openDropdown() {
        this._open = true;
        this._isInputClicked = true;
        window.addEventListener("click", this.handleClose);
    }

    closeDropdown() {
        this._open = false;
        this._isInputClicked = false;
        window.removeEventListener("click", this.handleClose);
    }

    handleClose = (event) => {
        if (this._isInputClicked) {
            this._isInputClicked = false;
            return;
        }
        if (this._over) return;
        this.closeDropdown();
    };

    formatDate(date, format = DATE_FORMAT) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
        if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
        return `${month}/${day}/${year}`;
    }

    parseDate(dateString, format = DATE_FORMAT) {
        if (!dateString) return null;
        let parts;
        if (format === 'MM/DD/YYYY') {
            parts = dateString.split('/');
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
        if (format === 'DD/MM/YYYY') {
            parts = dateString.split('/');
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (format === 'YYYY-MM-DD') {
            parts = dateString.split('-');
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        return new Date(dateString);
    }

    get outerDivClass2() {
        return `slds-form-element slds-dropdown-trigger slds-dropdown-trigger_click slds-size_1-of-1 ${this._open ? 'slds-is-open' : ''} ${this._error ? 'slds-has-error' : ''}`;
    }

    get inputClass() {
        return `slds-input ${this._error ? 'dateErrorBorder' : ''}`;
    }
}