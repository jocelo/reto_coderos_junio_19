
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }

    const storeCardNumber = writable('X');

    /* src/Card.svelte generated by Svelte v3.5.1 */

    const file = "src/Card.svelte";

    function create_fragment(ctx) {
    	var div5, div4, div0, t1, div1, img, t2, div2, t4, div3, div4_class_value;

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			div0.textContent = "image";
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "1234 1234 1234 1234";
    			t4 = space();
    			div3 = element("div");
    			div3.textContent = "Jose Alfredo Alonso Esquivel";
    			div0.className = "";
    			add_location(div0, file, 66, 4, 1384);
    			img.src = "http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/visa_logo_8.gif";
    			img.alt = "Visa logo-67*42.gif";
    			add_location(img, file, 67, 19, 1430);
    			div1.className = "";
    			add_location(div1, file, 67, 4, 1415);
    			div2.className = "";
    			add_location(div2, file, 68, 4, 1604);
    			div3.className = "";
    			add_location(div3, file, 69, 4, 1649);
    			div4.className = div4_class_value = "card " + ctx.classs + " svelte-42kz9d";
    			add_location(div4, file, 65, 2, 1351);
    			div5.className = "card-container svelte-42kz9d";
    			add_location(div5, file, 64, 0, 1319);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div0);
    			append(div4, t1);
    			append(div4, div1);
    			append(div1, img);
    			append(div4, t2);
    			append(div4, div2);
    			append(div4, t4);
    			append(div4, div3);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.classs) && div4_class_value !== (div4_class_value = "card " + ctx.classs + " svelte-42kz9d")) {
    				div4.className = div4_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let classs = '',
        cardNumber = '';

      const unsubscribe = storeCardNumber.subscribe(value=>{
        cardNumber = value.split('').splice(0,4).join('') + ' ' + 
          value.split('').splice(4,4).join('') + ' ' +
          value.split('').splice(8,4).join('') + ' ' +
          value.split('').splice(12,4).join('');

        if (value.length === 0) {
          $$invalidate('classs', classs = '');
          return;
        }

        if (value.length === 4 && value >= '2221' && value <= '2720') {
          $$invalidate('classs', classs = 'master-card');
          return;
        }

        if (value.length === 2 && value === '34' || value === '37') {
          $$invalidate('classs', classs = 'amex');
          return;
        }

        if (value.length === 1 && value === '4') {
          $$invalidate('classs', classs = 'visa');
          return;
        } 
        // Getting IIN details from: 
        // https://en.wikipedia.org/wiki/Payment_card_number#Structure
      });

    	return { classs };
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/AddForm.svelte generated by Svelte v3.5.1 */

    const file$1 = "src/AddForm.svelte";

    function create_fragment$1(ctx) {
    	var div6, form, div1, input0, input0_class_value, t0, div0, t1, div0_class_value, t2, div3, input1, t3, div2, t5, div4, input2, t6, input3, t7, input4, t8, div5, button, dispose;

    	return {
    		c: function create() {
    			div6 = element("div");
    			form = element("form");
    			div1 = element("div");
    			input0 = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Missing");
    			t2 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Missing";
    			t5 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t6 = space();
    			input3 = element("input");
    			t7 = space();
    			input4 = element("input");
    			t8 = space();
    			div5 = element("div");
    			button = element("button");
    			button.textContent = "agregar metodo de pago";
    			attr(input0, "type", "text");
    			input0.name = "card-number";
    			input0.placeholder = "Numero de tarjeta";
    			input0.className = input0_class_value = "" + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo";
    			input0.maxLength = "16";
    			add_location(input0, file$1, 81, 6, 1312);
    			div0.className = div0_class_value = "error-msg " + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo";
    			add_location(div0, file$1, 82, 6, 1470);
    			div1.className = "form-field svelte-ufuimo";
    			add_location(div1, file$1, 80, 4, 1280);
    			attr(input1, "type", "text");
    			input1.name = "card-name";
    			input1.placeholder = "Nombre de tarjetahabiente";
    			input1.className = "svelte-ufuimo";
    			add_location(input1, file$1, 86, 6, 1591);
    			div2.className = "error-msg svelte-ufuimo";
    			add_location(div2, file$1, 87, 6, 1677);
    			div3.className = "form-field svelte-ufuimo";
    			add_location(div3, file$1, 85, 4, 1559);
    			attr(input2, "type", "number");
    			input2.name = "exp-month";
    			input2.placeholder = "MM";
    			input2.className = "small-width svelte-ufuimo";
    			input2.min = "1";
    			input2.max = "12";
    			add_location(input2, file$1, 91, 6, 1782);
    			attr(input3, "type", "number");
    			input3.name = "exp-year";
    			input3.placeholder = "AAAA";
    			input3.className = "mid-width svelte-ufuimo";
    			input3.min = "2010";
    			input3.max = "2050";
    			add_location(input3, file$1, 92, 6, 1884);
    			attr(input4, "type", "number");
    			input4.name = "ccv";
    			input4.placeholder = "CVV";
    			input4.className = "mid-width svelte-ufuimo";
    			input4.min = "100";
    			input4.max = "999";
    			add_location(input4, file$1, 93, 6, 1990);
    			div4.className = "form-field back-of-card svelte-ufuimo";
    			add_location(div4, file$1, 90, 4, 1737);
    			button.type = "button";
    			button.className = "svelte-ufuimo";
    			add_location(button, file$1, 97, 6, 2134);
    			div5.className = "form-actions svelte-ufuimo";
    			add_location(div5, file$1, 96, 4, 2100);
    			form.className = "front-of-card";
    			add_location(form, file$1, 78, 2, 1244);
    			div6.className = "form-container svelte-ufuimo";
    			add_location(div6, file$1, 77, 0, 1212);

    			dispose = [
    				listen(input0, "input", ctx.input0_input_handler),
    				listen(button, "click", ctx.formSubmit)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, form);
    			append(form, div1);
    			append(div1, input0);

    			input0.value = ctx.cardNumber;

    			append(div1, t0);
    			append(div1, div0);
    			append(div0, t1);
    			append(form, t2);
    			append(form, div3);
    			append(div3, input1);
    			append(div3, t3);
    			append(div3, div2);
    			append(form, t5);
    			append(form, div4);
    			append(div4, input2);
    			append(div4, t6);
    			append(div4, input3);
    			append(div4, t7);
    			append(div4, input4);
    			append(form, t8);
    			append(form, div5);
    			append(div5, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.cardNumber && (input0.value !== ctx.cardNumber)) input0.value = ctx.cardNumber;

    			if ((changed.invalidForm) && input0_class_value !== (input0_class_value = "" + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo")) {
    				input0.className = input0_class_value;
    			}

    			if ((changed.invalidForm) && div0_class_value !== (div0_class_value = "error-msg " + (ctx.invalidForm ? 'invalid' : '') + " svelte-ufuimo")) {
    				div0.className = div0_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let invalidForm = false,
        cardNumber = '';
      
      function formSubmit() {
        $$invalidate('invalidForm', invalidForm = true);
      }

    	function input0_input_handler() {
    		cardNumber = this.value;
    		$$invalidate('cardNumber', cardNumber);
    	}

    	$$self.$$.update = ($$dirty = { cardNumber: 1 }) => {
    		if ($$dirty.cardNumber) { {
            console.log('something changed!!', cardNumber);
            storeCardNumber.set(cardNumber);
          } }
    	};

    	return {
    		invalidForm,
    		cardNumber,
    		formSubmit,
    		input0_input_handler
    	};
    }

    class AddForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.5.1 */

    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	var div, h2, t1, t2, current;

    	var card = new Card({ $$inline: true });

    	var addform = new AddForm({ $$inline: true });

    	return {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Agregar Nuevo Metodo de Pago";
    			t1 = space();
    			card.$$.fragment.c();
    			t2 = space();
    			addform.$$.fragment.c();
    			add_location(h2, file$2, 36, 1, 598);
    			div.className = "container svelte-n0gvl0";
    			add_location(div, file$2, 35, 0, 573);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h2);
    			append(div, t1);
    			mount_component(card, div, null);
    			append(div, t2);
    			mount_component(addform, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			card.$$.fragment.i(local);

    			addform.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			card.$$.fragment.o(local);
    			addform.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			card.$destroy();

    			addform.$destroy();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
    	let count = 0;

    	$$self.$$.update = ($$dirty = { count: 1 }) => {
    		if ($$dirty.count) { {
    				console.log(`the count is: ${count}`);
    			} }
    		if ($$dirty.count) { if (count == 9) {
    				alert('wachaoffffut !!');
    			} }
    	};

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
