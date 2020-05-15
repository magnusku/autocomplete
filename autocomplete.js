(() => {

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            div[role="combobox"] {
                width: 200px;
            }
            ul {
                border: 1px solid #ddd;
                list-style-type: none;
                padding: 0;
                margin: 0;
            }

            li {
                text-align: center;
                background-color: #fff;
            }
            li.item:nth-child(2) {
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
                this.showList(!this.isOpen);
                this.ul.firstChild.focus();
            });
        }

        addInputEventListener() {
            this.input.addEventListener('input', (e) => {
                this.showList(false);

                if(e.target.value.length > 0) {                    
                    this.ul.childNodes.forEach(child => {
                        if(child.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
                            child.style.display = 'block';
                            this.isOpen = true;
                        }
                    });
                }
            });

            this.shadowRoot.addEventListener('blur', () => {
                this.showList(false);
            });
        }

        addKeyboardListener() {
            this.shadowRoot.addEventListener('keydown', (e) => {

                switch (e.keyCode) {
                    case 38:
                        if (this.shadowRoot.activeElement === (this.input || this.ul.firstChild || this.button)) {
                            break;
                        } else if (this.shadowRoot.activeElement === this.ul.firstChild) {
                            this.input.focus();
                        } else { 
                            this.shadowRoot.activeElement.previousSibling.focus();
                        }
                        break;
                    case 40: 
                        if (this.shadowRoot.activeElement == (this.input || this.button)) {
                            this.showList(true)
                            this.ul.firstChild.focus(); 
                        
                        } else if(this.shadowRoot.activeElement === this.ul.lastChild){ 
                            break;
                        } else {
                            this.shadowRoot.activeElement.nextSibling.focus(); 
                        }
                    break;
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
                    list.forEach(item => {
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
            this.ul.childNodes.forEach(child => child.style.display = show ? 'block' : 'none');
            this.isOpen = show;
        }
    });

})();