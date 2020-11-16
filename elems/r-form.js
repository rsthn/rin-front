/*
**	rin-front/elems/r-form
**
**	Copyright (c) 2019-2020, RedStar Technologies, All rights reserved.
**	https://www.rsthn.com/
**
**	THIS LIBRARY IS PROVIDED BY REDSTAR TECHNOLOGIES "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
**	INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A 
**	PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL REDSTAR TECHNOLOGIES BE LIABLE FOR ANY
**	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
**	NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
**	OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, 
**	STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
**	USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
	<r-form data-action="api-function-name" [data-strict="true|false"]>
		<input type="text" data-field="username"/>
	</r-form>

	.form .message.hidden {
		display: none !important;
	}
*/

const { Rin } = require('@rsthn/rin');

const Element = require('../element');
const Api = require('../api');

Element.register ('r-form',
{
	/**
	**	Element events.
	*/
	events:
	{
		'change [data-field]': '_fieldChanged',

		'click input[type=reset]': 'reset',
		'click .reset': 'reset',

		'click input[type=submit]': 'submit',
		'click button[type=submit]': 'submit',
		'click .submit': 'submit',
		'submit form': 'submit'
	},

	/**
	**	Initializes the form element.
	*/
	init: function()
	{
		this.classList.add('form');

		this.setModel({ });
	},

	/**
	**	Executed when the children of the element are ready.
	*/
	ready: function()
	{
		let def = { };

		this.querySelectorAll("[data-field]").forEach((i) =>
		{
			i.name = i.dataset.field;

			let val = i.dataset.default;
			if (val == undefined)
			{
				switch (i.type)
				{
					case 'checkbox':
						val = i.checked ? '1' : '0';
						break;

					case 'file':
						val = '';
						break;

					default:
						val = '';
						break;
				}

				if (def[i.dataset.field] && (!val || (i.type == 'checkbox' && val == '0')))
					return;
			}

			def[i.dataset.field] = val;
		});

		this.model.defaults = def;
		this.model.reset();

		this._clearMarkers();
	},

	/*
	**	Transforms an string returned by the server to a local representation.
	*/
	filterString: function (str)
	{
		return str;
	},

	_change: function(elem)
	{
		if ('createEvent' in document)
		{
			let evt = document.createEvent('HTMLEvents');
			evt.initEvent('change', false, true);
			elem.dispatchEvent(evt);
		}
		else
			elem.fireEvent('onchange');
	},

	_setField: function (f, value, silent)
	{
		if (!f) return;

		if (typeof(f) == 'string')
		{
			f = this.querySelector('[data-field="'+f+'"]');
			if (!f) return;
		}

		switch (f.type || f.tagName.toLowerCase())
		{
			case 'select':
				f.dataset.value = f.multiple ? (value ? value.split(',') : value) : value;
				f.value = f.dataset.value;

				if (silent !== true) this._change(f);
				break;

			case 'checkbox':
				f.checked = parseInt(value) ? true : false;
				break;

			case 'file':
				if ((value instanceof File) || (value instanceof Blob))
				{
					f.dataset.value = value;
				}
				else if (value instanceof FileList)
				{
					f.dataset.value = value;
				}
				else
				{
					f.dataset.value = '';
					f.value = '';
				}

				break;

			default:
				f.dataset.value = value;
				f.value = value;

				if (silent !== true) this._change(f);
				break;
		}
	},

	_getField: function (f)
	{
		let value = f.value == null ? f.dataset.value : f.value;

		switch (f.type || f.tagName.toLowerCase())
		{
			case 'select':
				value = f.multiple ? (value ? value.join(',') : value) : value;
				break;

			case 'checkbox':
				value = f.checked ? '1' : '0';
				break;

			case 'file':
				value = f.files && f.files.length ? (f.multiple ? f.files : f.files[0]) : null;
				break;
		}

		return value;
	},

	_clearMarkers: function ()
	{
		this.classList.remove('busy');

		this.querySelectorAll('.message, .loading-indicator').forEach(i => i.classList.add('hidden') );
		this.querySelectorAll('span.field-error').forEach(i => i.remove());

		this.querySelectorAll('.field-error').forEach(i => { i.classList.remove('field-error'); i.classList.remove('is-invalid'); });
		this.querySelectorAll('.field-passed').forEach(i => i.classList.remove('field-passed'));
	},

	_fieldChanged: function (evt)
	{
		let f = evt.source;

		if (f.type == 'file')
			this.model.set (f.dataset.field, this._getField(f), true);
		else
			this.model.set (f.dataset.field, this._getField(f));
	},

	_onSuccess: function(r)
	{
		this.classList.remove('busy');

		let tmp = this.querySelector('.loading-indicator');
		if (tmp) tmp.classList.add('hidden');

		this.dispatch ('formSuccess', r);

		if (r.message && (tmp = this.querySelector('.message.success')) != null)
		{
			tmp.innerHTML = this.filterString(r.message);
			tmp.classList.remove('hidden');
		}
	},

	_onFailure: function(r)
	{
		this.classList.remove('busy');

		let tmp = this.querySelector('.loading-indicator');
		if (tmp) tmp.classList.add('hidden');

		this.dispatch ('formError', r);

		if (r.fields)
		{
			for (let i in r.fields)
			{
				tmp = document.createElement('span');
				tmp.classList.add('field-error');
				tmp.innerHTML = this.filterString(r.fields[i]);

				let f = this.querySelector('[data-field-container="'+i+'"]');
				if (!f) f = this.querySelector('[data-field="'+i+'"]');
				f.classList.add('field-error');
				f.classList.add('is-invalid');

				f.parentElement.insertBefore(tmp, f.nextElementSibling);

				setTimeout((function (tmp) { return function() { tmp.classList.add('active'); } })(tmp), 25);
			}

			if (r.error && (tmp = this.querySelector('.message.error')) != null)
			{
				tmp.innerHTML = this.filterString(r.error);
				tmp.classList.remove('hidden');
			}
		}
		else
		{
			if ((tmp = this.querySelector('.message.error')) != null)
			{
				tmp.innerHTML = this.filterString(r.error) || ('Error: ' + r.response);
				tmp.classList.remove('hidden');
			}
		}
	},

	onModelPropertyChanged: function (evt, args)
	{
		this._setField (args.name, args.value);
	},

	reset: function (nsilent)
	{
		this.model.reset (nsilent);
		this._clearMarkers();

		if (nsilent === false)
		{
			for (var i in this.model.data)
				this._setField (i, this.model.data[i], true);
		}

		return false;
	},

	submit: function ()
	{
		let data = this.model.get(this.dataset.strict == 'false' ? false : true);

		let f = this.action || this.dataset.action;
		if (!f)
		{
			let tmp = this.querySelector('form');
			if (!tmp) return;

			f = tmp.dataset.action;
			if (!f) return;
		}

		this._clearMarkers();

		this.classList.add('busy');

		let tmp = this.querySelector('.loading-indicator');
		if (tmp) tmp.classList.remove('hidden');

		if (typeof(f) != 'function')
		{
			data.f = f;
			Api.apiCall(data, (r) => this[r.response == 200 ? '_onSuccess' : '_onFailure'](r), (r) => this._onFailure({ error: 'Unable to execute request.' }));
		}
		else
			f(data, (r) => this[r.response == 200 ? '_onSuccess' : '_onFailure'](r));
	}
});
