/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CustomEventDestination, Destination, GraphQL } from "@atomist/automation-client";
import {
    CommandHandlerRegistration,
    // tslint:disable-next-line: ordered-imports
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine, truncateCommitMessage,
} from "@atomist/sdm-core";
// tslint:disable-next-line: no-implicit-dependencies
import _ = require("lodash");
import { detectActionableTweet, TrafficLightHandler } from "./handler";


/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm = createSoftwareDeliveryMachine({
        name: "Noma Hacks Bot Listener Sample",
        configuration,
    });

    /**
     * here's a simple registration of a function to call from from slack when you say "yo"
     * the bot can ask questions using parameters
     */
    sdm.addCommand({
        name: "whatever",
        intent: "yo",
        parameters: {
            hack: { required: true }
        },
        listener: async i => {

            const event = {
                id: "id",
                name: "name",
                description: "description",
            };
            const destination: CustomEventDestination = new CustomEventDestination("TrackData");
            await i.context.messageClient.send(event, destination);
            await i.addressChannels(`hack something with parameter ${_.get(i.parameters, "hack")}`);

            return;
        },
    });

    /**
     * here's an anonymous function that you could put behind a button whenever the bot 
     * notices something
     */
    const ActionCommand: CommandHandlerRegistration = {
        name: "action",
        parameters: {
            data: { required: true },
            user: { required: true }
        },
        listener: async i => {

            await i.addressChannels(`${_.get(i.parameters, "user")} just sent ${_.get(i.parameters, "data")}`);

            return;
        },
    };
    sdm.addCommand(ActionCommand);

    sdm.addIngester(GraphQL.ingester("hackdata"));
    sdm.addIngester(GraphQL.ingester("trafficlight"));

    sdm.addEvent({
        name: "watcher",
        subscription: GraphQL.subscription("hacksubscription"),
        listener: detectActionableTweet(ActionCommand),
    });

    sdm.addEvent({
        name: "trafficlight",
        subscription: GraphQL.subscription("trafficlight"),
        listener: TrafficLightHandler,
    });

    return sdm;
}
