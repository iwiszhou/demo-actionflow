const fs = require("fs")
var argv_ = require("minimist")(process.argv.slice(2))

const main = (argv) => {
    const { env, debug, store, android_localCredential: android_localCredential, use_medium_build_resource } = argv // e.g., env = "dev_voice_only"
    const debug_ = debug === "true"
    const publish = store === "true"
    const useAndroidLocalCredential = android_localCredential === "true"
    const useMediumBuildResource = use_medium_build_resource === "true"

    console.log("Copying environment variables from .env-cmdrc to eas.json")

    const envFile = fs.readFileSync(".env-cmdrc", { encoding: "utf-8" })
    const envJson = JSON.parse(envFile)
    const defaultConfig = envJson["default"]
    const envConfig = envJson[env]

    // json to be copied to eas.json at "[env]" key
    const easConfig = { ...defaultConfig, ...envConfig }
    // in case debug == true, we inject the following attributes to debug development build
    const debugAttributes = {
        android: {
            gradleCommand: ":app:assembleDebug",
        },
        ios: {
            buildConfiguration: "Debug",
        },
    }
    // load the existing eas.json
    const easJsonToBeAdjusted = JSON.parse(fs.readFileSync("eas.json", { encoding: "utf-8" }))

    // adjust the target build environment (prod, dev, uat, ..., etc)
    easJsonToBeAdjusted["build"][env] = {
        distribution: publish ? "store" : "internal",
        env: easConfig,
        ...(debug_ ? debugAttributes : {}),
    }
    if (useAndroidLocalCredential) {
        easJsonToBeAdjusted["build"][env]["android"] = { credentialsSource: "local" }
    }
    if (!useMediumBuildResource) {
        const androidConfig = easJsonToBeAdjusted["build"][env]["android"]
        const iosConfig = easJsonToBeAdjusted["build"][env]["ios"]
        easJsonToBeAdjusted["build"][env]["android"] = { ...androidConfig, resourceClass: "large" }
        easJsonToBeAdjusted["build"][env]["ios"] = { ...iosConfig, resourceClass: "large" }
    }
    easJsonToBeAdjusted["build"][env]["channel"] = env
    const adjustedEasJsonString = JSON.stringify(easJsonToBeAdjusted, null, 4)
    fs.writeFileSync("eas.json", adjustedEasJsonString)
}

main(argv_)
