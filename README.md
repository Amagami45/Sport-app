I built a fitness‑tracking app for Android using React Native and Expo. The goal of the project was to create a simple but functional sport companion that works fully offline, stores data locally, and gives users meaningful insights into their training. The app tracks steps(randomly)
, calories, and active minutes, and it supports both GPS‑based activities and manually entered ones. All activity data is saved using AsyncStorage, so the user can reset everything at any time.

The app also calculates several advanced training metrics. RAI (Running Ability Index) is computed from the user’s running activities over the last 30 days and visualized in a dedicated chart. TSS (Training Stress Score) is calculated per activity and displayed both as a daily value and as a 30‑day history graph. Running Power is also tracked and shown in its own chart. These graphs help users understand their progress and training load over time.

The homepage shows the current date, today’s steps, calories, and active minutes, along with the user’s most recent activity. The app also keeps long‑term totals for steps, calories, and activity time. FTP (Functional Threshold Power) can be entered manually in the settings, and the unit system can be switched between metric and imperial by tapping the “kg” label — this automatically converts both weight and distance units.

The APK is included in the GitHub release so the app can be installed directly on Android devices without using Expo Go. This project helped me learn how to structure a React Native app, manage persistent storage, build custom charts, and package an Expo project into a standalone Android build.

Please note that gps tracking works better with display on!

And here are some pictures of my app.
<img width="394" height="297" alt="Snímek obrazovky 2026-04-23 211059" src="https://github.com/user-attachments/assets/e399db41-bdd1-44da-9f50-d2ab201601ee" />
<img width="394" height="572" alt="Snímek obrazovky 2026-04-23 211048" src="https://github.com/user-attachments/assets/d0d81e46-3c0e-4660-bbcd-1f950ed7611a" />
<img width="400" height="435" alt="Snímek obrazovky 2026-04-23 211034" src="https://github.com/user-attachments/assets/2d4765e8-6f95-40b1-9a44-61ad387d964b" />
<img width="399" height="657" alt="Snímek obrazovky 2026-04-23 211017" src="https://github.com/user-attachments/assets/99448cbc-aadb-42f4-83e1-852ff650e2f9" />
<img width="392" height="409" alt="Snímek obrazovky 2026-04-23 210954" src="https://github.com/user-attachments/assets/69e0ff98-13f9-4bc9-9bcb-1be7fac7dc12" />
<img width="387" height="827" alt="Snímek obrazovky 2026-04-23 210916" src="https://github.com/user-attachments/assets/75407934-77fb-4f8c-b430-9261f363e023" />
<img width="396" height="729" alt="Snímek obrazovky 2026-04-19 132908" src="https://github.com/user-attachments/assets/3cf8490d-a5a5-4d97-92ee-6db9790afbd1" />
