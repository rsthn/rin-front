/*
**	rin-front/data-source
**
**	Copyright (c) 2013-2020, RedStar Technologies, All rights reserved.
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

const { Model, ModelList, EventDispatcher } = require('@rsthn/rin');
const Api = require('./api');

module.exports = EventDispatcher.extend
({
	className: 'DataSource',

	request: null,

	includeCount: false,
	includeEnum: false,
	includeList: true,

	eid: null,
	count: 0,
	list: null,
	enum: null,

	__ctor: function (basePath, config)
	{
		this._super.EventDispatcher.__ctor();

		this.basePath = basePath;
		this.request = new Model();

		if (config) Rin.override(this, config);

		this.eid = Math.random().toString().substr(2);
		this.count = 0;

		this.list = new ModelList();
		this.list.dataSource = this;

		this.enum = new ModelList();
		this.enum.dataSource = this;

		this.request.addEventListener (this.eid+':propertyChanged', this.forwardRequestEvent, this);

		this.list.addEventListener (this.eid+':itemsCleared', this.forwardListEvent, this);
		this.list.addEventListener (this.eid+':itemsChanged', this.forwardListEvent, this);
		this.list.addEventListener (this.eid+':itemRemoved', this.forwardListEvent, this);
		this.list.addEventListener (this.eid+':itemChanged', this.forwardListEvent, this);
		this.list.addEventListener (this.eid+':itemAdded', this.forwardListEvent, this);

		this.enum.addEventListener (this.eid+':itemsCleared', this.forwardEnumEvent, this);
		this.enum.addEventListener (this.eid+':itemsChanged', this.forwardEnumEvent, this);
		this.enum.addEventListener (this.eid+':itemRemoved', this.forwardEnumEvent, this);
		this.enum.addEventListener (this.eid+':itemChanged', this.forwardEnumEvent, this);
		this.enum.addEventListener (this.eid+':itemAdded', this.forwardEnumEvent, this);
	},

	forwardRequestEvent: function (evt, args)
	{
		this.prepareEvent('request' + evt.name[0].toUpperCase() + evt.name.substr(1), args).setSource(evt.source).resume();
	},

	forwardListEvent: function (evt, args)
	{
		this.prepareEvent('list' + evt.name[0].toUpperCase() + evt.name.substr(1), args).setSource(evt.source).resume();
	},

	forwardEnumEvent: function (evt, args)
	{
		this.prepareEvent('enum' + evt.name[0].toUpperCase() + evt.name.substr(1), args).setSource(evt.source).resume();
	},

	/*
	**	Refresh mode: order, filter, range or full.
	*/
	refresh: function (mode='full')
	{
		let n = (this.includeCount && (mode == 'full' || mode == 'filter')) + (this.includeEnum && (mode == 'full')) + this.includeList;
		if (n > 1) Api.packageBegin();

		if (this.includeCount && (mode == 'full' || mode == 'filter')) this.fetchCount();
		if (this.includeEnum && (mode == 'full')) this.fetchEnum();
		if (this.includeList) this.fetchList();

		if (n > 1) Api.packageEnd();
	},

	fetchList: function ()
	{
		this.request.set('f', this.basePath + '.list', false);
		Api.fetch(this.request.get()).then(r => {
			this.list.setData(r.response == 200 ? r.data : null);
			this.dispatchEvent('listChanged');
		});
	},

	fetchEnum: function ()
	{
		this.request.set('f', this.basePath + '.enum', false);
		Api.fetch(this.request.get()).then(r => {
			this.enum.setData(r.response == 200 ? r.data : null);
			this.dispatchEvent('enumChanged');
		});
	},

	fetchCount: function ()
	{
		this.request.set('f', this.basePath + '.count', false);
		Api.fetch(this.request.get()).then(r => {
			this.count = r.response == 200 ? r.count : 0;
			this.dispatchEvent('countChanged');
		});
	}
});
