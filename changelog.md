###Changelog for canopy
- 1.2.1.1
 - Fixed issie with too many users shown in hangouts, i.e > 10 thanks to Mohammed Eshbeata
 - Changed intervals for detection and monitoring to 60s and 30s, also started teh detection of when extension is loaded.
- 1.2.1.0
 - Started to use the Search to detect hangotus instead of the main stream.
 - Added try/catch to popup template engine in case of broken hangouts.
- 1.2.0.1
 - Uploaded to Google Chrome Store
 - Fixed Hangotus not being removed
 - Changed server structure to reduce bandwidth and icnrease stability

- Public server chages
 - Server now sorts alphabetically, if the creator of the hangout is in the hangout they will be show first
 - Increased initial connection load from 5 to 10, this is the inital hangouts for the client
