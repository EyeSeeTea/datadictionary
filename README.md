# Data Dictionary

Web Application (Dhis2 App) to visualize (1) a picture of the metadata in the database and its connection across programs, datasets, health facilities, and (2) how the data is being used and filled across the different countries and platforms. It has been developed using jQuery, D3 and html technologies.

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
Configure the DHIS url in [the manifest.webapp](manifest.webapp#L6) depending on your DHIS server.

### Dashboard tab configuration

For the dashboard tabs two sql views are required:
- sqlView: This sql view lists all the dashboards in the database. This information can be retrieved using the dhis2 API. The sql view id can be configured [here](index.html#L98)
- sqlViewEdit: This sql provides the user group id. The user group id is required for the Edit link in each row. This link will allow to edit a dashboard. The sql view id can be configured [here](index.html#L101)

This sql views have to be inserted in the DHIS2 server. Its ids will be shown in the preference menu.
