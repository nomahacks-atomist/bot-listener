import { HandlerContext } from "@atomist/automation-client";
import _ = require("lodash");
import { actionableButton, slackFooter, CommandHandlerRegistration } from "@atomist/sdm";

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