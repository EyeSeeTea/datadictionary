# Data Dictionary

Web Application (Dhis2 App) to visualize (1) a picture of the metadata in the database and its connection across programs, datasets, health facilities, and (2) how the data is being used and filled across the different countries and platforms. It has been developed using jQuery, D3 and html technologies.

DHIS2, a flexible, web-based open source information system to collect and analyze information, is being used by PSI as its HMIS. Data is feeding dayly from up to 15.000 sites across 60+ countries, allowing analysis of the health programs impact at district, country, and global level. 

## Sections

* Org Unit
* Datasets & Programs
* Dashboard
* Data Element Groups
* Indicator Groups
* User (In progress)
* Org Groups (In progress)
* DB Progress (In progress)

## Configuration
Configure the DHIS url in [the manifest.webapp](manifest.webapp#L7) depending on your DHIS server instance:
```
"activities":{"dhis":{"href":"../dhis/"}}
```

### Dashboard tab configuration

For the dashboard tabs two sql views are required:
- sqlView: This sql view lists all the dashboards in the database. This information can be retrieved using the dhis2 API. The sql view id can be configured [here](index.html#L98)
```
<input id="sqlViewSettings" type="text" value="[INSERT_SQLVIEW_ID]"/>
```

- sqlViewEdit: This sql provides the user group id. The user group id is required for the Edit link in each row. This link will allow to edit a dashboard. The sql view id can be configured [here](index.html#L101)
```
<input id="sqlViewEditSettings" type="text" value="[INSERT_SQLVIEW_EDIT_ID]"/
```

This sql views have to be inserted in the DHIS2 server. Its ids will be shown in the preference menu.
