const fs = require("fs")
var argv_ = require("minimist")(process.argv.slice(2))

const main = (argv) => {
    const versionJsonFilepath = "./versioning.json"
    const appJsonFilepath = "./app.json"
    const dotenvFilepath = "./.env-cmdrc"
    const { platform, env, version } = argv

    // load files
    const versioningJson_ = fs.readFileSync(versionJsonFilepath, { encoding: "utf-8" })
    const versioningJson = JSON.parse(versioningJson_)

    const appJson_ = fs.readFileSync(appJsonFilepath, { encoding: "utf-8" })
    const appJson = JSON.parse(appJson_)

    const dotenvJson_ = fs.readFileSync(dotenvFilepath, { encoding: "utf-8" })
    const dotenvJson = JSON.parse(dotenvJson_)

    // change files in memory

    const appName = versioningJson[env]["name"]
    const scheme = versioningJson[env]["scheme"]
    const appVersion = versioningJson["version"]
    const appVersion_ = appVersion.split(".")

    if (env === "uat" && platform === "ios") {
        // ios-uat build is the most frequent build for app store / google play in our development team
        appVersion_[2] = (Number(appVersion_[2]) + 1).toString()
    }
    const newAppVersion = appVersion_.join(".")

    versioningJson["version"] = newAppVersion
    if (platform === "ios") {
        versioningJson[env][platform]["buildNumber"] += 1
    } else {
        versioningJson[env][platform]["versionCode"] += 1
    }

    if (version) {
        versioningJson[env][platform]["version"] = version
    }

    const bundleIdentifier = versioningJson[env]["ios"]["identifier"]
    const package = versioningJson[env]["android"]["identifier"]
    appJson["expo"]["name"] = appName
    appJson["expo"]["version"] = versioningJson["version"]
    appJson["expo"]["ios"]["bundleIdentifier"] = bundleIdentifier
    appJson["expo"]["ios"]["buildNumber"] = versioningJson[env]["ios"]["buildNumber"].toString()
    appJson["expo"]["android"]["versionCode"] = versioningJson[env]["android"]["versionCode"]
    appJson["expo"]["android"]["package"] = package
    appJson["expo"]["scheme"] = scheme

    console.log("New app.json")
    console.log(appJson)

    dotenvJson["default"]["EXPO_PUBLIC_VERSION"] = versioningJson["version"]

    const adjustedVersioningJson = JSON.stringify(versioningJson, null, 4)
    const adjustedAppJSON = JSON.stringify(appJson, null, 4)
    const adjustedDotenvJSON = JSON.stringify(dotenvJson, null, 4)

    // write files

    fs.writeFileSync(versionJsonFilepath, adjustedVersioningJson)
    fs.writeFileSync(appJsonFilepath, adjustedAppJSON)
    fs.writeFileSync(dotenvFilepath, adjustedDotenvJSON)
}

main(argv_)
