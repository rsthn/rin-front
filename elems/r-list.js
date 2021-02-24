/*
**	rin-front/elems/r-list
**
**	Copyright (c) 2019-2021, RedStar Technologies, All rights reserved.
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
	<r-list data-list="window.dataList1" data-container=".x-data">

		<template data-mode="static|dynamic">
		</template>

		<div class="x-data">
		</div>

	</r-list>

	CSS:
		.x-hidden {
			display: none;
		}

	Modifiers:
		.x-empty			Show the element when there is no data in the table.
		.x-not-empty 		Shows the element when there is data in the table.
*/

const { Rin, ModelList, Template } = require('@rsthn/rin');
let Element = require('../element');

/*
**	Connects to a ModelList and renders its contents using a template. When using "dynamic" template, the contents can be other custom elements, and
**	the model of each item can be accessed by using data-model=":list-item", which will cause the item model to be added to the element.
*/

Element.register ('r-list',
{
	list: null,

	container: null,
	template: null,
	isEmpty: false,
	isDynamic: false,

	/**
	**	Initializes the element.
	*/
	init: function()
	{
		this.container = this.querySelector(this.dataset.container || '.x-data');
		if (!this.container) this.container = this;

		let tmp = this.querySelector('template');

		if (tmp)
		{
			if (tmp.dataset.mode != 'dynamic')
			{
				this.template = Template.compile(tmp.innerHTML);
			}
			else
			{
				this.template = () => tmp.innerHTML;
				this.isDynamic = true;
			}

			tmp.remove();
		}
		else
			this.template = () => '';

		this.container.textContent = ' ';
		this.setEmpty(true);
	},

	/**
	**	Executed when the children of the element are ready.
	*/
	rready: function()
	{
		let list = this.getFieldByPath(this.dataset.list);
		if (!list)
		{
			console.error('List not found: ' + this.dataset.list);
			return;
		}

		this.setList (list);
	},

	/*
	**	Indicates if the list is empty. Elements having x-when-empty will be hidden.
	*/
	setEmpty: function (value)
	{
		if (this.isEmpty === value)
			return;

		if (value)
		{
			this.querySelectorAll('.x-empty').forEach(i => i.classList.remove('x-hidden'));
			this.querySelectorAll('.x-not-empty').forEach(i => i.classList.add('x-hidden'));
		}
		else
		{
			this.querySelectorAll('.x-empty').forEach(i => i.classList.add('x-hidden'));
			this.querySelectorAll('.x-not-empty').forEach(i => i.classList.remove('x-hidden'));
		}

		this.isEmpty = value;
	},

	/**
	**	Sets the list model-list of the element.
	*/
	setList: function (list)
	{
		if (!list || !Rin.isTypeOf(ModelList, list) || this.list === list)
			return;

		if (this.list != null)
			this.list.removeEventListener (this.eid+':*');

		this.list = list;

		this.list.addEventListener (this.eid+':itemsCleared', this.onItemsCleared, this);
		this.list.addEventListener (this.eid+':itemsChanged', this.onItemsChanged, this);
		this.list.addEventListener (this.eid+':itemRemoved', this.onItemRemoved, this);
		this.list.addEventListener (this.eid+':itemChanged', this.onItemChanged, this);
		this.list.addEventListener (this.eid+':itemAdded', this.onItemAdded, this);
	},

	/*
	**	Builds an item (inside a div) to be added to the container.
	*/
	buildItem: function (iid, data)
	{
		let elem = document.createElement('div');
		
		elem.dataset.iid = iid;
		elem.innerHTML = this.template(data.get());

		elem.querySelectorAll('[data-model=":list-item"]').forEach(i => {
			i.model = data;
			i.dataset.model = "this.model";
		});

		return elem;
	},

	/*
	**	Executed when the list is cleared.
	*/
	onItemsCleared: function(evt, args)
	{
		this.container._timeout = setTimeout(() => {
			this.setEmpty(true);
			this.container._timeout = null;
			this.container.textContent = '';
		}, 300);
	},

	/*
	**	Executed when the items of the list changed.
	*/
	onItemsChanged: function(evt, args)
	{
		if (this.list.length() == 0)
			return;

		if (this.container._timeout)
			clearTimeout(this.container._timeout);

		this.container._timeout = null;
		this.container.textContent = '';

		let i = 0;

		for (let data of this.list.getData())
			this.container.append(this.buildItem(this.list.itemId[i++], data));

		this.setEmpty(i == 0);
	},

	/*
	**	Executed when an item is removed from the list.
	*/
	onItemRemoved: function(evt, args)
	{
		let elem = this.container.querySelector('[data-iid="'+args.id+'"]');
		if (!elem) return;

		elem.remove();
		this.setEmpty(this.list.length() == 0);
	},

	/*
	**	Executed when an item changes.
	*/
	onItemChanged: function(evt, args)
	{
		if (this.isDynamic) return;

		let elem = this.container.querySelector('[data-iid="'+args.id+'"]');
		if (!elem) return;

		elem.innerHTML = this.template(args.item);
	},

	/*
	**	Executed when an item is added to the list.
	*/
	onItemAdded: function(evt, args)
	{
		if (args.position == 'head')
			this.container.prepend(this.buildItem(args.id, args.item));
		else
			this.container.append(this.buildItem(args.id, args.item));

		this.setEmpty(false);
	}
});