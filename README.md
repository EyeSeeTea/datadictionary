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

## Preferences
 * Organization Unit Level: Set the level for the organization unit. It defines the organization unit level for the Org Unit Tab.
 * Dashboard SQL View Id: Show the sqlViewSettings and sqlViewEditSettings Id for the dashboard tab. These fields are read only and the moment they have to be defined in the code before deploying the app.

## Configuration
Configure the DHIS url in [the manifest.webapp](manifest.webapp#L7) depending on your DHIS server instance:
```
"activities":{"dhis":{"href":"../dhis/"}}
```
You will find some sample files in the root folder.

There is also [a 'layout' parameter in the manifest.webapp](manifest.webapp#L11) that allows you to customise the application. This parameter is currently read in the index.js and layout changes are applied depending on it.
```
"layout":"[INSERT_LAYOUT]"
```

### Dashboard tab configuration

For the dashboard tab two sql views are required:
- sqlView: This sql view lists all the dashboards in the database. This information can be retrieved using the dhis2 API. The sql view id can be configured [here](index.html#L98)
```
<input id="sqlViewSettings" type="text" value="[INSERT_SQLVIEW_ID]"/>
```

- sqlViewEdit: This sql provides the user group id. The user group id is required for the Edit link in each row. This link will allow to edit a dashboard. The sql view id can be configured [here](index.html#L101)
```
<input id="sqlViewEditSettings" type="text" value="[INSERT_SQLVIEW_EDIT_ID]"/
```
These ids will be shown in the preference menu.

The sql views have to be created in the DHIS2 server. Find below the sql sentences:
- sqlView:
```
SELECT * FROM dashboard;
```

- sqlViewEdit:
```
SELECT usergroupid, uid, name, userid FROM usergroup;
```

## Feedback

We’d love to hear your thoughts on the initiative in general, improvements, new features or any of the technologies being used. Just drop as a line at <a href="hello@eyeseetea.com">hello@eyeseetea.com</a> and let us know! If you prefer, you can also create a new issue on our GitHub repository. Note that you will have to register and be logged in to GitHub to create a new issue.

## License

This app is licensed under GPLv3. Please respect the terms of that license.
