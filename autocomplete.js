(() => {

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            div[role="combobox"] {
                width: 200px;
            }
            ul {
                position: absolute;
                z-index: 2;
                width: 200px;
                list-style-type: none;
                padding: 0;
                margin: 0;
            }

            li {
                text-align: center;
                background-color: #fff;
                border-left: 1px solid #ddd;
                border-right: 1px solid #ddd;
            }
            li:last-child {
                border-bottom: 1px solid #ddd;
            }
            li:nth-child(2) {
                background-color: #eee;
            }

            li:hover, li:active {
                background: #ddd;
            }

            
            input {
                display: inline-block;
                width: 180px;
            }

            button {
                display: inline-block;
                width: 15px;
                margin: 0;
                padding: 2;
            }
        </style>

        <div role="combobox">
            <input id="input"/>
            <button>&#9660;</button>
            <ul></ul>
        </div>
    `;

    window.customElements.define('mk-autocomplete', 

    class AutoComplete extends HTMLElement {
        
        static get observedAttributes() {
            return ['placeholder'];
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
            if(oldValue !== newValue) {
                this.applyAttributes();
            }
        }
        
        constructor() {
            super();
            
            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            this.list = [];
            
            this.combobox = this.shadowRoot.querySelector('[role=combobox]');
            this.input = this.shadowRoot.querySelector('input');
            this.ul = this.shadowRoot.querySelector('ul');
            this.button = this.shadowRoot.querySelector('button');

            this.isOpen = false;
        }
        
        connectedCallback() {
            this.addInputEventListener();
            this.addClickEventListener();
            this.addButtonClickListener();
            this.addKeyboardListener();
            this.doRequest();
        }

        addClickEventListener() {
            this.ul.addEventListener('click', (event) => {
                if(event.target && event.target.classList.contains('item')) {
                    this.input.value = event.target.innerText;
                    this.showList(false);
                }
            });
        }

        addButtonClickListener() {
            this.button.addEventListener('click', () => {
               this.openDropdown();
               if(this.isOpen) {
                   this.visibleItems[0].focus();
               }
            });
        }

        openDropdown() {
            if(this.isOpen) {
                this.showList(false)
            } else if (this.input.value.length > 0){
                this.showMatchingListItems(this.input.value);
                this.ul.firstChild.focus();
            } else {
                this.showList(true);
            }

        }

        addInputEventListener() {
            this.input.addEventListener('input', (event) => {
                this.showMatchingListItems(event.target.value);
            });
        }

        showMatchingListItems(input) {
            this.showList(false);

            if(input.length > 0) {                    
                this.ul.childNodes.forEach(child => {
                    if(child.innerText.toLowerCase().indexOf(input.toLowerCase()) > -1) {
                        child.style.display = 'block';
                        child.setAttribute('show', '');
                        this.isOpen = true;
                    }
                });

                this.visibleItems = this.shadowRoot.querySelectorAll('li[show]');
            }
        }

        addKeyboardListener() {
            this.shadowRoot.addEventListener('keydown', (event) => {
                const upArrow = 38, 
                    downArrow = 40, 
                    enter = 13,
                    esc = 27;

                const activeElement = this.shadowRoot.activeElement;    

                if(!this.isOpen) this.openDropdown();

                switch (event.keyCode) {
                    case upArrow:
                        if (activeElement === (this.input || this.visibleItems[0] || this.button)) {
                            break;
                        } else if (activeElement === this.visibleItems[0]) {
                            this.input.focus();
                        } else { 
                            for(let i = 0; i < this.visibleItems.length; i++) {
                                if(activeElement === this.visibleItems[i]) {
                                    this.visibleItems[--i].focus();
                                    break;
                                }
                            }
                        }
                        break;
                    case downArrow: 
                        if(activeElement === this.visibleItems[this.visibleItems.length-1]) {
                            break;
                        } else if (activeElement == (this.input || this.button)) {
                            this.visibleItems[0].focus();
                        } else {

                            for(let i = 0; i < this.visibleItems.length; i++) {
                                if(activeElement === this.visibleItems[i]) {
                                    this.visibleItems[++i].focus();
                                    break;
                                }
                            }
                        }
                        break;
                    case enter:
                        if(activeElement && activeElement.tagName === 'LI') {
                            this.input.focus();
                            this.showList(false);
                            this.input.value = activeElement.innerText;
                        }
                        break;
                    case esc: 
                        if(activeElement === this.input ) {
                            this.input.value = '';
                        } 
                        if (this.isOpen) {
                            this.showList(false);
                        }
                        this.input.focus();
                        break;
                    default: this.input.focus();
                    }
            });
        }

        doRequest() {
            const request = new XMLHttpRequest();
            
            request.open('GET', this.getAttribute('url'), true);
            request.onload = () => {
                const STATUS_OK = request.status >= 200 && request.status < 300;
                if(STATUS_OK) {
                    const list = JSON.parse(request.responseText);
                    list.sort().forEach(item => {
                        const li = document.createElement('li');
                        li.innerText = item;
                        li.classList.add('item');
                        li.setAttribute('tabIndex', '-1')
                        li.style.display = 'none';
                        this.ul.appendChild(li);
                    });
                }
            }

            request.send();
        }

        applyAttributes() {
            if (this.hasAttribute('placeholder')) {
                this.shadowRoot.querySelector('input').setAttribute('placeholder', this.getAttribute('placeholder'));
            }
        }

        showList(show) {
            this.ul.childNodes.forEach(child => {
                child.style.display = show ? 'block' : 'none';
                child[show ? 'setAttribute' : 'removeAttribute']('show', '');
                this.isOpen = show;
            });
            this.visibleItems = this.shadowRoot.querySelectorAll('li[show]');
        }
    });

})();