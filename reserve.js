const puppeteer = require('puppeteer')
const moment = require('moment-timezone')
const url = require('url')
const axios = require('axios')
const cron = require('node-cron');

var axiosCalCnt = 5, axiosCalDuration = 100
const res_s_time_h = 8

var debug = false
var dbg_r_t = 20, dbg_r_m = 45, dbg_res_t = 10;

const timeZone = 'America/Chicago' // Change to your desired time zone
const agencies = [
    {
        username: 'Raavi.tillu@gmail.com',
        email: 'raavi.tillu@gmail.com',
        firstname: 'Venkata ',
        lastname: 'Raavi',
        password: 'test0701',
        memberId: "2082394",
        orgMemberId: "2275756",
        memberFamilyId: "703341",
        resinfo: [
            {
                weekday: 3, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
                time: 20 // 8 AM CST
            },
            {
                weekday: 4, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
                time: 20 // 8 AM CST
            },
            // {
            //     weekday: 5, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
            //     time: 20 // 8 AM CST
            // },
            // {
            //     weekday: 6, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
            //     time: 20 // 8 AM CST
            // },
            // {
            //     weekday: 0, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
            //     time: 20 // 8 AM CST
            // },
            {
                weekday: 1, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
                time: 20 // 8 AM CST
            },
            {
                weekday: 2, // 0: Sun, 1 : Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
                time: 20 // 8 AM CST
            },
        ]
    }
]

const nextWeekTm = function (wDay) {
    // Define the time zone you want to use

    // Function to get the next Weekday at a specific time
    function getNextWeekdayAtTime(wDay, hour, minute, second = 0) {
        // Get the current time in the specified time zone
        const now = moment().tz(timeZone)

        // Calculate the number of days until the next Weekday
        var daysUntilNextWeekday = ((7 + wDay) - now.day()) % 7

        // Create a target time for next Weekday
        const nextWeekday = now.clone().add(daysUntilNextWeekday, 'days').startOf('day').set({ hour, minute, second })

        return nextWeekday
    }

    // Get the next Weekday at 8:00 AM
    const nextWeekdayAt8AM = getNextWeekdayAtTime(wDay, res_s_time_h, 0)

    // Get the next Weekday at 7:50 AM
    const nextWeekdayAt750AM = getNextWeekdayAtTime(wDay, res_s_time_h - 1, 50)

    // Output the results
    console.log(`Next Weekday${wDay} at 8:00 AM in ${timeZone}: ${nextWeekdayAt8AM.format('YYYY-MM-DD HH:mm:ss')}`)
    console.log(`Next Weekday${wDay} at 7:50 AM in ${timeZone}: ${nextWeekdayAt750AM.format('YYYY-MM-DD HH:mm:ss')}`)

    return [nextWeekdayAt8AM, nextWeekdayAt750AM]
}
const cstTm = async function () {
    // Get current time in Central Time (with DST adjustment)
    const cstTimeWithDST = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss')
    console.log('Current time in CST/CDT:', cstTimeWithDST)
    return moment().tz(timeZone)
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
function timeDiffMs(targetTm) {
    // Get the current time in CST
    const nowInCST = moment().tz(timeZone)

    console.log(`Current time in CST: ${nowInCST.format('YYYY-MM-DD HH:mm:ss')}`)

    // If the target time has already passed, set it for the next occurrence
    if (nowInCST.isAfter(targetTm)) {
        // targetTm.add(1, 'year'); // Adjust this for different intervals (e.g., next month, next week)
        console.log(`Already passed target time in CST: ${targetTm.format('YYYY-MM-DD HH:mm:ss')}`)
        return 0
    } else {
        // Calculate the delay in milliseconds
        const diffMs = targetTm.diff(nowInCST)
        console.log(`Waiting until target time in CST: ${targetTm.format('YYYY-MM-DD HH:mm:ss')}`)

        return diffMs
    }
}
const btnClickAct = async function (page, selector) {
    try { res = await page.waitForSelector(selector, { visible: true }) } catch (err) { console.log(err) }
    const anchors = await page.$$(selector)
    // var _anchor = null;
    // console.log(anchors.length)
    // const detailsList = await Promise.all(anchors.map(async (anchor) => {
    //     let info = await page.evaluate(el => {
    //         if (el instanceof HTMLAnchorElement) {
    //             return {
    //                 start: el.start,
    //                 end: el.end,
    //                 courtlabel: el.courtlabel,
    //             };
    //         }
    //         return null;
    //     }, anchor);
    //     _anchor = anchor;
    //     return info
    // }));
    // console.log(detailsList)
    console.log(selector, anchors.length)
    if (anchors.length > 0) { await anchors[0].click() }
}
const travissoReserve = async function (_requestData, _RequestVerificationToken, agency, resTm) {
    // Define the URL and parameters
    const url = 'https://reservations.courtreserve.com//Online/ReservationsApi/CreateReservation/10656';
    const params = {
        uiCulture: 'en-US'
    };

    // Define the request headers
    const headers = {
        'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'Accept': '*/*',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'host': 'reservations.courtreserve.com'
    };

    const body = {
        AllowMemberToPickOtherMembersToPlayWith: "True",
        CanSelectCourt: "False",
        CostTypeAllowOpenMatches: "True",
        CourtId: "37198",
        CourtTypeEnum: "9",
        CustomSchedulerId: "",
        CustomSchedulerId: "",
        Date: resTm.clone().startOf('day').format('M/D/yyyy') + " 12:00:00 AM",
        Description: "",
        DisclosureName: "",
        DisclosureText: "",
        Duration: "120",
        DurationType: "",
        HoldTimeForReservation: "15",
        Id: "10656",
        Id: "10656",
        InstructorId: "",
        InstructorName: "",
        IsAllowedToPickStartAndEndTime: "False",
        IsAllowedToPickStartAndEndTime: "False",
        IsConsolidated: "False",
        IsConsolidatedScheduler: "False",
        IsCourtRequired: "False",
        IsEligibleForPreauthorization: "False",
        IsFromDynamicSlots: "False",
        IsMultipleCourtRequired: "False",
        IsOpenReservation: "false",
        IsResourceReservation: "False",
        IsToday: "False",
        MatchMakerGender: "",
        MatchMakerMaxAge: "",
        MatchMakerMaxNumberOfPlayers: "",
        MatchMakerMinAge: "",
        MatchMakerMinNumberOfPlayers: "2",
        MatchMakerSelectedRatingIdsString: "",
        MatchMakerTypeId: "",
        MaxAllowedCourtsPerReservation: "1",
        MemberId: agency.memberId,
        MemberIds: "",
        MembershipId: "106661",
        OrgId: "10656",
        OrgId: "10656",
        OwnersDropdown: "",
        OwnersDropdown_input: "",
        RegisteringMemberId: agency.memberId,
        RequestData: _requestData,
        RequirePaymentWhenBookingCourtsOnline: "False",
        ReservableEntityName: "Court",
        ReservationQueueId: "",
        ReservationQueueSlotId: "",
        ReservationTypeId: "49180",
        SelectedCourtType: "Pickleball - Pickleball Court #1",
        SelectedCourtTypeId: "0",
        'SelectedMembers[0].Email': agency.email,
        'SelectedMembers[0].FirstName': agency.firstname,
        'SelectedMembers[0].LastName': agency.lastname,
        'SelectedMembers[0].MemberId': agency.memberId,
        'SelectedMembers[0].MembershipNumber': agency.orgMemberId,
        'SelectedMembers[0].OrgMemberFamilyId': agency.memberFamilyId,
        'SelectedMembers[0].OrgMemberId': agency.orgMemberId,
        'SelectedMembers[0].PaidAmt': "",
        SelectedNumberOfGuests: "",
        SelectedResourceId: "",
        SelectedResourceName: "",
        StartTime: resTm.clone().format('HH:mm:ss'),
        UseMinTimeByDefault: "False",
        'X-Requested-With': "XMLHttpRequest",
        '__RequestVerificationToken': _RequestVerificationToken
    };

    // Make the POST request
    try {
        axios.post(url, body, {
            params: params, // Query parameters
            headers: headers // Request headers
        }).then(res => {
            console.log(res.data)
        });
    } catch (err) {
        console.log(err)
    }
}
const reserve = async function (agency) {
    var now = moment().tz(timeZone)
    var shouldRunBrowser = false
    agency.resinfo.forEach((resDayTm) => {
        if (now.weekday() == resDayTm.weekday) {
            shouldRunBrowser = true
        }
    })

    if (shouldRunBrowser) {
        let browser;
        let page;
        let requestData = '';
        let requestVerifyToken = '';
        try {
            browser = await puppeteer.launch({ headless: false, timeout: 1000 * 60 * 60 * 24 })
            page = await browser.newPage()
            page.setDefaultTimeout(1000 * 60 * 60 * 24) // a day
            await page.setRequestInterception(true)
            page.on('request', (request) => {
                if (request.url().includes('SchedulerApi/ReadExpandedApi')) {
                    const parseUrl = url.parse(request.url(), true)
                    requestData = parseUrl.query.requestData
                }
                request.continue();
            })
            await page.goto('https://app.courtreserve.com')
            await delay(5000)
            await page.type('#Username', agency.username)
            await delay(5000)
            await page.type('#Password', agency.password)
            await page.click('.btn-submit')
            await delay(10000)

            await page.goto('https://app.courtreserve.com/Online/Reservations/Index/10656')
            // await page.waitForNavigation({ waitUntil: 'networkidle2' })

            const cookies = await page.cookies('https://app.courtreserve.com')
            requestVerifyToken = cookies.find(cookie => cookie.name == '__RequestVerificationToken').value

            await new Promise(resolve => {
                setInterval(() => {
                    if (requestData != '') resolve()
                }, 100);
            })

            for (let i = 0; i < agency.resinfo.length; i++) {
                var agencyRes = agency.resinfo[i]
                if (now.weekday() == agencyRes.weekday) {
                    var dbgResTm = moment().tz(timeZone).clone().startOf('day').set({ hour: dbg_r_t, minute: dbg_r_m, second: 0 })
                    if (!debug) {
                        tmArr = nextWeekTm(agencyRes.weekday)
                        dbgResTm = tmArr[0].clone()
                    }
                    while (timeDiffMs(dbgResTm) > 0) {
                        await delay(100)
                    }
                    console.log(`Started: `, moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss'))

                    for (let i = 0; i < axiosCalCnt; i++) {
                        travissoReserve(requestData, requestVerifyToken, agency, debug ? moment().tz(timeZone).clone().add(1, 'days').startOf('day').set({ hour: dbg_res_t, minute: 0, second: 0 }) : tmArr[0].add(7, 'days').startOf('day').set({ hour: agencyRes.time, minute: 0, second: 0 }))
                        await delay(axiosCalDuration)
                    }
                    console.log(`${agency.username} ${agencyRes.weekday} ${agencyRes.time}`, moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss'))
                }
            }
        } catch (err) {
            console.log(err)
        } finally {
            console.log(`${agency.username}'s booking slot finished`)
            browser.close();
        }
    }
}
const main = async function () {
    // Define the schedule
    // const schedule = `55 ${res_s_time_h - 1} * * *`; // Example: At midnight on August 15th (format: minute hour day month dayOfWeek)
    const schedule = `55 7 * * *`; // Example: At midnight on August 15th (format: minute hour day month dayOfWeek)
    cstTm()

    // Schedule the task
    if (debug) {
        agencies.forEach(agency => {
            reserve(agency)
        })
    } else {
        cron.schedule(schedule, () => {
            agencies.forEach(agency => {
                reserve(agency)
            })
        }, {
            scheduled: true,
            timezone: timeZone
        });
    }

}
main()
