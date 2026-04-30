GET https://samsung.u-vis.com/mobile/LoginAction.do?method=combolist&SELECT_FLAG=PUBLIC_CUSTOMER

no authentication required
lists all site id and name

---

GET  https://samsung.u-vis.com/mobile/LoginAction.do?method=loginProcJson&USER_ID=e4ab4f06-e053-42f0-a062-acd8410d53fb&N_PASSWD=e4ab4f06-e053-42f0-a062-acd8410d53fb&logintype=NORMAL&GUEST_YN=Y&CUST_ID=CI130708000013&DEVICE_HP_NUMBER=&DEVICE_TYPE=A&DEVICE_ID=e4ab4f06-e053-42f0-a062-acd8410d53fb&USER_SEQ=&REGISTRATIONID_TOKEN=&APP_ID=kr.co.s1.uvisgen.gcm


get authentication cookies
you do not need to change any value


---

GET https://samsung.u-vis.com/mobile/RouteAction.do?method=RouteSearch&CUST_ID=CI130708000011&SEARCH_TEXT=&START_TIME=&END_TIME=&RT_DAY_CODE=123001&SEARCH_TYPE=05&CURPAGE=1&POSTNUM=10000&RM_FLAG=1&Latitude=&Longitude=&Distance=

get bus route list

need authentication

RM_FLAG can be 1 (출근) or 2 (퇴근)
change, CUST_ID and RM_FLAG only

---

GET https://samsung.u-vis.com/mobile/RouteAction.do?method=RouteList&RM_IDX=16884

get bus station list

need authentication
change RM_IDX only

---

GET https://samsung.u-vis.com/mobile/RouteAction.do?method=RouteCarLocation&RM_IDX=32878

get live bus locations for a route

need authentication
change RM_IDX only

BI_X_POSITION is latitude
BI_Y_POSITION is longitude
