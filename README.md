# Data Dictionary

Web Application (Dhis2 App) to visualize (1) a picture of the metadata in the database and its connection across programs, datasets, health facilities, and (2) how the data is being used and filled across the different countries and platforms. It has been developed using jQuery, D3 and html technologies.

DHIS2, a flexible, web-based open source information system to collect and analyze information, is being used by PSI as its HMIS. Data is feeding dayly from up to 15.000 sites across 60+ countries, allowing analysis of the health programs impact at district, country, and global level. 

## Sections

* Org Unit
* Datasets & Programs
* Dashboard
* Data Element Groups
* Indicator Groups

## Automatic Setup

Every time the app starts, it will run this setup process:

* Check if the user role _DataDictionary admin_ exists, otherwise it will be created. By default, this role includes the authority _Admin Data Dictionary_. Users with that authority are considered admins and can change some settings of the app (see below). Likewise, a user having the authority _ALL_ set is also considered an admin.

* Create the 2 SQL views required by the Dashboard tab. 

## Global settings

 * Organization Unit Level: It defines the organization unit level for the Org Unit Tab.
 * Dashboard List/Join SQLView Id: Show the sqlViewSettings and sqlViewEditSettings IDs used to render the dashboard tab. 
 
Note that only admins of the app can change those values.
 
## Table settings

The tables shown in the tabs DataSets & Programs, Data Elements Group and Indicator Groups are configurable. You may change which settings are used (user/organizational), and configure the columns clicking on the edit button nearby. You can change which columns are visible, their order, and the sorting criteria. Similarly, you can customize the rows shown in the popup table. Note that only admins can modify the organizational settings. 

## Configuration

Configure the DHIS url in [the manifest.webapp](manifest.webapp#L7) depending on your DHIS server instance:
```
"activities":{"dhis":{"href":"../dhis/"}}
```

### Dashboard tab configuration

For the dashboard tabs, those two sql views are created automatically:

- Dashboard List SQLView Id: This query lists all the dashboards in the database. This information can be retrieved using the dhis2 API. 

- Dashboard Join SQLView Id: This query provides the user group id. The user group id is required for the Edit link in each row. This link will allow to edit a dashboard. 

## Feedback

We’d love to hear your thoughts on the initiative in general, improvements, new features or any of the technologies being used. Just drop as a line at <a href="hello@eyeseetea.com">hello@eyeseetea.com</a> and let us know! If you prefer, you can also create a new issue on our GitHub repository. Note that you will have to register and be logged in to GitHub to create a new issue.

## License

This app is licensed under GPLv3. Please respect the terms of that license.
