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

import {
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    CommandHandlerRegistration,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine,
} from "@atomist/sdm-core";
import _ = require("lodash");

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

            await i.addressChannels(`hack something with parameter ${_.get(i.parameters, "hack")}`);

            return;
        }
    });

    /**
     * here's an anonymous function that you could put behind a button whenever the bot 
     * notices something
     */
    sdm.addCommand({
        name: "action",
        parameters: {
            data: { required: true }
        },
        listener: async i => {

            await i.addressChannels(`I just heard a ${_.get(i.parameters, "data")}`);

            return;
        }
    })

    return sdm;
}
