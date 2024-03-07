/*
    Testing Area
*/

const fs = require('fs');
const path = require("path");

const {UAsset} = require("./reader");

//Get all files in directory
function getAllFiles(dirPath) {
    let filesList = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
            filesList.push(filePath);
        } else if (stat.isDirectory()) {
            // Recursively get files from subdirectories
            filesList = filesList.concat(getAllFiles(filePath));
        }
    }

    return filesList;
}


async function RunTest()
{
    const Files = getAllFiles("testfiles");
    for (const fi in Files)
    {
        const File = Files[fi];
        console.log("------------------------- Probing #: " + File);
        const Asset = new UAsset(File);
        await Asset.load();

        if(Asset.getUnrealVersion() !== null)
        {
            console.log(Asset.toJSON());
        }
        else
        {
            console.error("File: " + File + " is not an UAsset!" );
        }
   
    }
}


RunTest();