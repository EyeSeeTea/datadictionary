# Data Dictionary

App for analysing the metadata of a Dhis2 instance


## Configuration
Configure the DHIS url in [the manifest.webapp](manifest.webapp#L6) depending on your DHIS server.

For the dashboard tabs two sql views are required:

- sqlView: This sql view lists all the dashboards in the database. This information can be retrieved using the dhis2 API. The sql view id can be configured [here](index.html#L81)
- sqlViewEdit: This sql provides the user group id. The user group id is required for the Edit link in each row. This link will allow to edit a dashboard. The sql view id can be configured [here](index.html#L84)

