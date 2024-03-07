/*
************************************************
    UAsset Reader for Node.js
************************************************

MIT License
-----------

Copyright (c) 2024 Marc Fraedrich (contact@marcfraedrich.de)
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/



const afs = require("fs/promises");

module.exports.UAsset = class UAsset{

    constructor(filePath)
    {
        this.filePath = filePath;
        this.FileBuffer = null;
        this.UnrealPath = null;
    }

    async load()
    {
        try
        {
            this.FileBuffer =   await afs.readFile(this.filePath);
            this.UnrealPath = this.searchForString(0x100, "/Game/");
        }
        catch(err)
        {
            throw(err);
        }
    }

    findOffsetByString(offset, searchString) {
        // Convert the search string to a buffer for byte comparison
        const searchBuffer = Buffer.from(searchString);
      
        for (let i = offset; i <= this.FileBuffer.length - searchBuffer.length; i++) {
          // Use buffer.compare to check if the next bytes match the search string
          if (this.FileBuffer.compare(searchBuffer, 0, searchBuffer.length, i, i + searchBuffer.length) === 0) {
            // If a match is found, return the current offset
            return i;
          }
        }
        // If the string is not found, return -1 or null (depending on your error handling preference)
        return -1;
    }

    isPrintableASCII(str) {
        return /^[\x20-\x7E]*$/.test(str);
    }

    isPreviousByteNull(offset) {
        // Ensure the offset is within bounds and not at the start of the buffer
        if (offset > 0 && offset < this.FileBuffer.length) {
            return this.FileBuffer[offset - 1] === 0x00;
        } else {
            // If the offset is 0, there's no previous byte to check, return false
            // Or if the offset is outside the buffer length, it's also invalid
            return false;
        }
    }

    isNextByteNull(offset) {
        // Ensure the offset is within bounds
        if (offset < this.FileBuffer.length) {
            return this.FileBuffer[offset] === 0x00;
        } else {
            // If the offset is outside the buffer, it's invalid
            return false;
        }
    }

    getStringByOffset(offset)
    {
    // Initialize an empty string
        let result = '';
 
        // Loop through each byte until we reach a null byte (0x00)
        for (let i = offset; i < this.FileBuffer.length; i++) {
             if (this.FileBuffer[i] === 0x00) {
                // We've reached the end of the string
             break;
        }
            // Append each character to the result string
            result += String.fromCharCode(this.FileBuffer[i]);
        }
        if(this.isPrintableASCII(result))
        {
            return result;
        }
        else
        {
            return "<NonReadableStringAt" + offset+">";
        }
    }


    findOffsetsByString(startOffset, searchString)
    {
        const searchBuffer = Buffer.from(searchString);
        let foundIndizies = [];
    
        for (let i = startOffset; i <= this.FileBuffer.length - searchBuffer.length; i++) {
            // Use buffer.compare to check if the next bytes match the search string
            if (this.FileBuffer.compare(searchBuffer, 0, searchBuffer.length, i, i + searchBuffer.length) === 0) {
              // If a match is found, return the current offset
              foundIndizies.push(i);
            }
        }
        return foundIndizies;
    }

    getUnrealVersion()
    {
        let result = null;
  
        //Search for the Engine Version.
        const offset = this.findOffsetByString(0x100, "++UE");
        //Check if offset is a full string by checking if the previous byte is null.
        if(this.isPreviousByteNull(offset))
        {
            //Gathering the possible string at offset.
            let possibleString = this.getStringByOffset(offset);

            //check if the string is readable
            if(this.isPrintableASCII(possibleString))
            {
                //Check if the string isn't empty
                if(possibleString !== "" && possibleString.length > 5 && !possibleString.includes("NonReadableStringAt"))
                {
                    result = possibleString;
                }
            }
        }
        return result;
    }

    searchForString(startOffset, searchString) {
        let result = null;
      
        // Search for the string starting at the given offset
        const offset = this.findOffsetByString(startOffset, searchString);
    
        // Check if the offset is valid (non-negative) and if the previous byte is null
        if(offset >= 0 && this.isPreviousByteNull(offset)) {
            // Gathering the possible string at offset
            let possibleString = this.getStringByOffset(offset);
    
            // Check if the string is readable and has the expected characteristics
            if(this.isPrintableASCII(possibleString) && possibleString !== "" && possibleString.length > 5 && !possibleString.includes("NonReadableStringAt")) {
                // Check if the byte immediately following the string is null
                if(this.isNextByteNull( offset + possibleString.length)) {
                    result = possibleString;
                }
            }
        }
    
        return result;
    }

    getAssetType()
    {
        //Search for the following Types.
        const availableTypes = ["/Script/Engine/Material", "/Script/Engine.StaticMesh", "/Script/Engine.SkeletalMesh", "/Script/Engine.Material", "/Script/Engine.Texture2D"];
        for(let t in availableTypes)
        {
            const type = availableTypes[t];
            let ret = this.searchForString( 0x1000, type);
            if(ret !== null)
            {
                return ret;
            }
        }    
        return null;
    }
    
    getAssetDependencies()
    {
        let list = [];
        const Offsets = this.findOffsetsByString(0x100, "/Game/");
        for(const i in Offsets)
        {
            const file = this.getStringByOffset(Offsets[i]);
            if(file !== this.UnrealPath)
            {
                list.push(file);
            }
        
        }
        return list;
    }

    toJSON()
    {
        return({engine: this.getUnrealVersion(), uepath: this.UnrealPath, type: this.getAssetType(), dependencies: this.getAssetDependencies()});
    }

}




