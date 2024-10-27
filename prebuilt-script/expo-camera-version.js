const fs = require("fs")
var argv_ = require("minimist")(process.argv.slice(2))

const main = (argv) => {
    // const { ver } = argv // e.g., env = "dev_voice_only"
    // const packageJson = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8" }))
    // packageJson["dependencies"]["expo-camera"] = ver
    // fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
}
main(argv_)
