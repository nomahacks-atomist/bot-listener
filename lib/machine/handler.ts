import { HandlerContext, OnEvent } from "@atomist/automation-client";
import _ = require("lodash");
import { actionableButton, slackFooter, CommandHandlerRegistration } from "@atomist/sdm";

const green = "https://previews.123rf.com/images/paulfleet/paulfleet1003/paulfleet100300010/6601670-illustration-of-a-green-traffic-light-on-a-country-road.jpg";
const red = "https://www.featurepics.com/StockImage/20100312/traffic-light-stock-illustration-1483581.jpg";
const yellow = "https://5.imimg.com/data5/KI/JV/MY-741745/amber-traffic-signal-light-500x500.png";

var webster = red;
var university = red;

export const TrafficLightHandler: OnEvent = async (e: any, context: HandlerContext) => {

    const data = _.get(e, "data.TrafficLight[0]");
    const street = _.get(data, "street");
    const color = _.get(data, "color");

    if (street === "University") {
        switch (color) {
            case "RED": university = red; break;
            case "YELLOW": university = yellow; break;
            case "GREEN": university = green; break;
        };
    }
    if (street === "Webster") {
        switch (color) {
            case "RED": webster = red; break;
            case "YELLOW": webster = yellow; break;
            case "GREEN": webster = green; break;
        };
    }

    context.messageClient.addressChannels(
        {
            attachments: [
                {
                    text: "University",
                    image_url: university,
                    fallback: "university"
                },
                {
                    text: "Webster",
                    image_url: webster,
                    fallback: "webster"
                }
            ]
        },
        "atomist-bot-listener",
        { id: "trafficlight" }
    );
    return {
        code: 0
    }
};

export function detectActionableTweet(action: CommandHandlerRegistration) {
    return async (e: any, context: HandlerContext) => {

        const data = _.get(e, "data.TrackData[0]");
        const screenName: string = _.get(data, "screen_name");
        const text: string = _.get(data, "text");

        await context.messageClient.addressChannels({
            text: `I just detected a tweet from ${screenName}`,
            attachments: [
                {
                    text: `${text}`,
                    fallback: "none",
                    actions: [
                        actionableButton<any>(
                            {
                                text: "Take Action",
                            },
                            action,
                            {
                                data: text,
                                user: screenName
                            },
                        ),
                    ],
                    color: "#ffcc00",
                    footer: slackFooter(),
                    callback_id: "atm-confirm-done",
                }
            ]
        },
            "atomist-bot-listener");

        return {
            code: 0,
            message: "successfully processed this"
        };
    }
}