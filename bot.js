import Slack from 'slack-node';
import schdulePkg from 'node-schedule';
import RtmPkg from '@slack/rtm-api';

// personal function, command, contents, information
import { getRoles } from './yejiseo/lotsRole.js';
import { command } from './yejiseo/command.js';
import { contents } from './yejiseo/contents.js';
import { information } from './yejiseo/information.js';

// get myToken, slackBot imgage, and channels to send a messages
const {
	myToken,
	imageUrl,
	selfChannel,
	generalChannel,
	teamChannel,
	teamMember,
} = information;

// get a commands filtering what to do
const {
	roleList,
	mogacko,
	helper,
	studyMeetingRoom,
	github,
	name,
	hi,
	lunch,
	dinner,
	blogName,
	story,
	branchList,
	booksRecommend,
	search,
	call,
} = command;

// get a messages to send by command
const {
	help,
	linkOfMogacko,
	linkOfStudy,
	linkOfGithub,
	greetingText,
	lunchText,
	dinnerText,
	blogLinks,
	bookList,
	storyList,
} = contents;

// get a function and class
const { scheduleJob } = schdulePkg;
const { RTMClient } = RtmPkg;

// get a personal Bot token
const token = process.env.SLACK_TOKEN || myToken;

const slack = new Slack(token);

// function to send message
const send = async (message, channel = selfChannel) => {
	slack.api(
		'chat.postMessage',
		{
			username: '서예지', // 슬랙에 표시될 봇이름
			text: message[Math.floor(Math.random() * message.length)],
			channel, // 메시지가 전송될 채널
			icon_url: imageUrl,
		},
		function (err, response) {
			// console.log(response);
		}
	);
};

// Check Date and Time when this bot start
let time = new Date();
send([`${time}`], selfChannel);

/**
 * slackbot cannot send several messages in a second.
 * Just one message is allowed in a second.
 */
// Schedule Jobs
scheduleJob('00 50 08 * * 1-5', () => {
	send(greetingText, teamChannel);
});
scheduleJob('02 50 08 * * 1-5', () => {
	send(['시프티 출근했어?'], teamChannel);
});
scheduleJob('00 09 * * 1-5', () => {
	send(['시프티 출근했냐구'], teamChannel);
});
scheduleJob('55 11 * * 1-5', () => {
	send(lunchText, generalChannel);
});
scheduleJob('00 12 * * 1-5', () => {
	send(lunchText, teamChannel);
});
scheduleJob('05 18 * * 1-5', () => {
	send(dinnerText, teamChannel);
});
scheduleJob('10 18 * * 1-5', () => {
	send(dinnerText, generalChannel);
});
scheduleJob('00 18 * * 1-5', () => {
	send(['시프티 퇴근했어?'], teamChannel);
});
scheduleJob('00 20 * * 1-5', () => {
	send(['시프티 퇴근했냐구'], teamChannel);
});

// send result url in search engine
const sendSearchResult = (textArr, channel) => {
	const tmpArr = textArr.filter((x) => x !== '검색!');
	let searchEngine;
	if (tmpArr[0] === '네이버') {
		searchEngine = tmpArr.shift();
		const naver = [
			`https://search.naver.com/search.naver?ie=UTF-8&query=${tmpArr.join(
				'+'
			)}&sm=chr_hty`,
		];
		send(naver, channel);
	} else if (tmpArr[0] === '다음') {
		searchEngine = tmpArr.shift();
		const daum = [
			`https://search.daum.net/search?w=tot&&q=${tmpArr.join('+')}`,
		];
		send(daum, channel);
	} else if (tmpArr[0] === '유튜브' || tmpArr[0] === '유튭') {
		searchEngine = tmpArr.shift();
		const youtube = [
			`https://www.youtube.com/results?search_query=${tmpArr.join('+')}`,
		];
		send(youtube, channel);
	} else if (tmpArr[0] === '구글') {
		searchEngine = tmpArr.shift();
		const google = [`https://www.google.com/search?q=${tmpArr.join('+')}`];
		send(google, channel);
	} else {
		searchEngine = '구글';
		const google = [`https://www.google.com/search?q=${tmpArr.join('+')}`];
		send(google, channel);
	}
};

// Real Time Messages
const rtm = new RTMClient(token);
rtm.start();

rtm.on('message', (message) => {
	// console.log('---------------------------message: ', message);
	if (!message.hidden) {
		let text = message.text;
		if (text.split(' ').some((x) => search.includes(x))) {
			sendSearchResult(text.split(' '), message.channel);
		}
		if (text.split(' ').includes('<@U019ZCZGQ1F>')) {
			send(['바쁘니까 호출하지마'], message.channel);
		}
		if (
			message.channel === generalChannel &&
			text.split(' ').some((x) => name.includes(x))
		) {
			text = text.split(' ');
			if (text.some((x) => hi.includes(x))) {
				send(['말 시키지마 대사 못외웠어'], generalChannel);
			} else if (text.some((x) => booksRecommend.includes(x))) {
				send(bookList, generalChannel);
			} else if (text.some((x) => mogacko.includes(x))) {
				send(linkOfMogacko, generalChannel);
			}
		}
		if (message.channel === teamChannel || message.channel === selfChannel) {
			let tmpChannel;
			if (message.channel === selfChannel) {
				tmpChannel = selfChannel;
			} else {
				tmpChannel = teamChannel;
			}
			if (text.split(' ').filter((x) => name.includes(x)).length > 0) {
				text = text.split(' ');
				text.shift();
				if (text.some((x) => github.includes(x))) {
					send(linkOfGithub, tmpChannel);
				} else if (text.some((x) => studyMeetingRoom.includes(x))) {
					send(linkOfStudy, tmpChannel);
				} else if (text.some((x) => booksRecommend.includes(x))) {
					send(bookList, tmpChannel);
				} else if (text.some((x) => helper.includes(x))) {
					send(help, tmpChannel);
				} else if (text.some((x) => branchList.includes(x))) {
					send(branch, tmpChannel);
				} else if (text.some((x) => roleList.includes(x))) {
					send([getRoles('result')], tmpChannel);
				} else if (text.some((x) => hi.includes(x))) {
					send(greetingText, tmpChannel);
				} else if (text.some((x) => lunch.includes(x))) {
					send(lunchText, tmpChannel);
				} else if (text.some((x) => dinner.includes(x))) {
					send(dinnerText, tmpChannel);
				} else if (text.some((x) => mogacko.includes(x))) {
					send(linkOfMogacko, tmpChannel);
				} else if (text.some((x) => blogName.includes(x))) {
					send(blogLinks, tmpChannel);
				} else if (text.some((x) => story.includes(x))) {
					send(storyList, tmpChannel);
				} else if (text.some((x) => call.includes(x))) {
					send([teamMember.join(' ')], tmpChannel);
				} else if (text.some((x) => x === '현재시각')) {
					time = new Date();
					send([String(time)], tmpChannel);
				}
			}
		}
	}
});
