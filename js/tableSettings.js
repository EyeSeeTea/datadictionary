/*
 *  Copyright (c) 2015-2017.
 *
 *  This file is part of Data Dictionary.
 *
 *  Data Dictionary is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Data Dictionary is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Data Dictionary.  If not, see <http://www.gnu.org/licenses/>.
 */

TableSettings = function(user, schemaSection, box, redrawTable) {
	var username = user.userCredentials.username;
	var userFullName = user.name;
	var IsDDAdmin = _(user.authorities).contains("Admin Data Dictionary");
	
	this._bindCallbacks = function(callbacks) {
		_.each(callbacks, _.bind(function(cb) {
			var eventName = cb[0], selector = cb[1], fun = cb[2];
			box.off(eventName, selector);
			box.on(eventName, selector, _.bind(fun, this));
		}, this));
	};
	
	this.setup = function() {
		this._bindCallbacks([
			["click", ".table-settings-edit", this.onEditClick],
			["click", ".toggle-column-visibility", this.onColumnVisibilityClick],
			["click", ".select-all", this.onSelectAll],
			["click", ".select-none", this.onSelectNone],
			["click", ".tables-config-column-save", this.onSaveClick],
			["click", ".tables-config-column-cancel", this.onCancelClick],
			["click", ".table-settings-selector", this.onSelectSettingsKeyClick]
		]);

		var table = this.getTable();
		$("#user-settings-label").text(userFullName + "'s settings");      
		box.find(".table-settings").html($("#table-settings").get(0).innerHTML);
		box.find(".help").attr("title", table.helpMessage);
		table.setup();
	};
	
	this.onSelectAll = function(ev) {
	  ev.preventDefault();
	  box.find(".toggle-column-visibility").filter(":not(.visible)").trigger("click");
	};

	this.onSelectNone = function(ev) {
	  ev.preventDefault();
	  box.find(".toggle-column-visibility").filter(".visible").trigger("click");
	};
	
	this.onSelectSettingsKeyClick = function(ev) {
		ev.preventDefault();
		var table = this.getTable();
		var key = table.data("state-key");
		if (key) {
			$("#tables-config-key-" + key).prop("checked", true);
			$("#tables-config-key").dialog({
			  title: "Visualization settings", 
			  modal: true, 
			  autoOpen: true
			 });
			$(document.body).off("change", "#tables-config-key .keys input");
			$(document.body).on("change", "#tables-config-key .keys input",
				_.bind(this.onSelectSettingsKeyChange, this));
			_.defer(function() { $(":focus").blur(); });
		}
	};
	
	var getSettingsConfigKey = function() {
		return "tables-" + schemaSection + "-" + username + "-key";
	};

	this.onSelectSettingsKeyChange = function(ev) {
		ev.preventDefault();
		var newKey = $(ev.target).val()
		this.saveSettings(getSettingsConfigKey(schemaSection), 
			newKey, _.bind(this.restoreState, this));
	};
	
	this.onEditClick = function(ev) {
		ev.preventDefault();
		this.toggleTableConfig();  
	};
	
	this.toggleTableConfig = function() {
		var table = this.getTable();
		var configColumnsBox = box.find(".tables-config-columns");
		var editButton = $(".table-settings-edit");
		var editStarted = !configColumnsBox.is(":visible");
		
		if (editStarted) {
			this.renderConfigColumns();
			table.editStarted(_.bind(this.renderConfigColumns, this));
		} else {
			table.editFinished();
		}
		configColumnsBox.slideToggle();
	};
	
	this.renderConfigColumns = function() {
		var table = this.getTable();
		var links = _
			.chain(table.getColumns())
			.map(function(column) {
				return [ 
					$("<span>").text(" | "), 
					$("<a>", {href: "#"})
						.addClass("toggle-column-visibility")
						.addClass(table.isColumnVisible(column.key) ? "visible" : null)
						.data("column-key", column.key)
						.text(column.title) 
				];
			})
			.flatten(true)
			.slice(1);
		var wrapper = $("<span>").append(links.value());
		box.find(".tables-config-columns .columns").html(wrapper);
	};
	
	this.getTable = function() {
		if (box.find(".dataTable").length > 0) {
			return new DtTable(box.find(".dataTable"));
		} else if (box.find(".listTable").length > 0) {
			return new PopupTable(box.find(".listTable"));
		} else {
			throw "Cannot find table in box";
		}
	};
	
	this.onColumnVisibilityClick = function(ev) {
		ev.preventDefault();
		var toggleColumnEl = $(ev.target);
		var table = this.getTable();
		var columnKey = toggleColumnEl.data("column-key");
		toggleColumnEl.toggleClass("visible");
		table.setColumnVisible(columnKey, toggleColumnEl.hasClass("visible"));
	};
	
	this.fnReorderCallback = function() {
		this.renderConfigColumns();
	}
	
	this.init = function(tableEl) {
		tableEl.data("state-type", schemaSection);
	}

	this.onSaveClick = function(ev) { 
		ev.preventDefault();
		var table = this.getTable();
		var state = table.state();
		var key = table.data("state-key");
		var info = getStateInfo(key, username);
		var editButton = box.find(".table-settings-edit");
		this.saveSettings(info.configKey, state, 
			_.bind(function() { this.toggleTableConfig(table); }, this));
	};

	this.saveSettings = function(key, value, onsuccess) {
		var spinner = $(".spinner");
		spinner.addClass("active");
		
		return DhisUtils.saveSettings(apiPath, "datadictionary", key, value)
			.always(function() {
				spinner.removeClass("active");
			})
			.done(function(data) {
				onsuccess();
			})
			.fail(function() { 
				spinner.text("Error"); 
				setTimeout(function() { spinner.text(""); }, 500);
			});
	};
		
	this.saveState = function(table) {
		table.data("oldState", table.state());
	};

	this.restoreState = function() {
		if (!redrawTable || redrawTable())
			this.loadState();
	};

	this.onCancelClick = function(ev) {
		ev.preventDefault();
		var table = this.getTable();
		this.toggleTableConfig(table);  
		this.restoreState();
	};
	
	this.loadTableState = function(key, callback) {
		var table = this.getTable();
		var info = getStateInfo(key, username);
		var link = box.find(".table-settings-selector");
		var stateResponse = undefined;

		var deferred = (key === "default") ? 
			$.Deferred().resolve(null) :
			DhisUtils.loadSettings(apiPath, "datadictionary", info.configKey, {async: false});
		
		deferred
			.done(function(state) {
				table.data("state-key", key);
				link.text(info.linkText);
				table.draw(state);
				// TEMPORAL: Until DataTables/ColReorder#62 is fixed
				stateResponse = state;
				// callback(state);
			})
			.fail(function() {
				table.data("state-key", key);
				link.text(info.linkText);
				table.draw(null);
				// TEMPORAL: Until DataTables/ColReorder#62 is fixed
				stateResponse = null;
				// callback(null); 
			})
		// TEMPORAL: Until DataTables/ColReorder#62 is fixed, use always with async promise
		_.defer(_.bind(function() {
			box.find(".table-settings-links").show();
			box.find(".table-settings-edit").toggle(info.canEdit);
			this.renderConfigColumns();
		}, this));              
			
		return stateResponse;
	};  

	var getStateInfo = function(key, username) {
		if (key === "default") {
			return {
				configKey: null, 
				linkText: "Default settings", 
				canEdit: false
			};
		} else if (key === "organization") {
			return {
				configKey: "tables-" + schemaSection + "-state-organization", 
				linkText: "Organizational settings", 
				canEdit: IsDDAdmin
			};
		} else if (key === "user") {
			return {
				configKey: "tables-" + schemaSection + "-state-user-" + username, 
				linkText: userFullName + "'s settings", 
				canEdit: true
			};
		} else {
			throw "[tableSettings:getStateInfo] Unknown key: " + key;
		}
	}
	
  // There is an issue in the state loading when using the async callback. For now
  // use sync loading with an instance variable.
	this.stateLoadCallback = function(settings, callback) {
		return this.loadState(callback);
	}

	this.loadState = function(callback) {
	  // TEMPORAL: Until DataTables/ColReorder#62 is fixed. Set state box within the sync promises 
	  var state = undefined;
	  
		DhisUtils.loadSettings(apiPath, "datadictionary", getSettingsConfigKey(), {async: false})
			.then(null, function() { return $.Deferred().resolve("default"); })
			.done(_.bind(function(key) { state = this.loadTableState(key, callback || _.identity); }, this));
		return state;
	}
}

// Table interfaces: datatables.js used in main page, custom tables used on popup details 

DtTable = function(el) {
	var dtable = el.dataTable();
	var api = dtable.DataTable();

	this.helpMessage = "You can now 1) toggle the visibility of columns, 2) change the sorting criteria of the columns and 3) reorder the columns by drag&drop on the column header. Remember to press [Save] to persist the changes or press [Cancel] to reload the saved state";	

	this.setup = function() {};
	
	this.state = function() { return _.omit(api.state(), "start"); };

	this.editStarted = function(onReorder) {};
	
	this.editFinished = function() {};
	
	this.draw = function(state) {};
	
	this.getColumns = function() {
		return _.chain(api.columns().header())
			.map(function(th, idx) { return {key: idx, title: $(th).text()}; })
			.value();
	};
	
	this.isColumnVisible = function(idx) { return api.column(idx).visible(); };

	this.setColumnVisible = function(idx, visibility) { 
		return api.column(idx).visible(visibility);  
	};
	
	this.data = _.bind(el.data, el);
};

PopupTable = function(el) {
	var columnIndexAttr = "column-index";
	
	this.helpMessage = "You can now 1) toggle visibility of columns and 2) reorder the rows by drag&drop directly on the table. Remember to press [Save] to persist the changes or press [Cancel] to reload the saved state";

	var getRowByTitle = function(title) {
		return el
			.find("tr > td.title")
			.filter(function() { return $(this).text() === title; })
			.closest("tr");
	};
	
	this.setup = function() {
		// Save original positions of rows to use on default settings
		el.find("tr").each(function(idx, tr) { $(tr).attr(columnIndexAttr, idx); });
	};

	var getTrByOriginalPosition = function(index) { 
		return el.find("tr[" + columnIndexAttr + "=" + index + "]") 
	};
	
	this.state = function() {
		var columnsPosition = _.chain(el.find("td.title"))
			.map(function(td, idx) { return [$(td).text(), idx]; })
			.object()
			.value();
		var columnsVisibility = _.chain(el.find("td.title"))
			.map(function(td, idx) { return [$(td).text(), $(td).is(":visible")]; })
			.object()
			.value();
		return {columns: {position: columnsPosition, visibility: columnsVisibility}};
	};

	this.draw = function(state) {
		// Hide table to avoid visual flickering and show when finished
		el.hide();
		
		if (state) {
			// Columns visibility
			_.each(state.columns.visibility, function(isVisible, key) {
				getRowByTitle(key).toggle(isVisible);
			});
			
			// Columns positions
			var invertedPositions = _.invert(state.columns.position);
			var reversedFinalPositions = _.sortBy(state.columns.position, _.identity).reverse();
			_.each(reversedFinalPositions, function(finalPosition) {
				var columnKey = invertedPositions[finalPosition];
				var row = getRowByTitle(columnKey);
				el.prepend(row);
			});
		} else {
			// Columns visibility
			el.find("tr").show();
			
			// Columns positions
			var reversedPositions = _.range(el.find("tr").length).reverse();
			_.each(reversedPositions, function(pos) { el.prepend(getTrByOriginalPosition(pos)); });
		}
		
		el.show();
	};
	
	this.getColumns = function() {
		return _.chain(el.find("td.title"))
			.map(function(td) { return {key: $(td).text(), title: $(td).text()}; })
			.value();
	};
	
	this.editStarted = function(onReorder) {
		el.find("tbody").sortable({stop: onReorder});
		el.find("tbody").sortable("enable");
	};

	this.editFinished = function() {
		el.find("tbody").sortable("disable");
	};
	
	this.isColumnVisible = function(key) {
		return getRowByTitle(key).is(":visible");  
	};

	this.setColumnVisible = function(key, visibility) {
		return getRowByTitle(key).toggle(visibility);  
	};
	
	this.data = _.bind(el.data, el);
};
