# UAssetReader

Very basic approach to read UAsset Files in Node.js.

It can return it's Engine Version, the Unreal Path, Asset Type and it's Dependencies. Currently works well with Unreal Engine 5.++ Assets.
Older Assets doesn't seem to be parsed very well.


# Usage

```js
const {UAsset} =  require("uassetreader");

const  Asset  =  new  UAsset(<PathToUAsset>);
//Load the Asset into Buffer
await  Asset.load();

//Return Asset Information
Asset.toJSON();
/*
Returns:
{
  engine: '++UE5+Release-5.3',
  uepath: '/Game/SomeAsset/SK_SomeAsset',
  type: '/Script/Engine.SkeletalMesh',
  dependencies: [
    '/Game/SomeAsset/Material/M_SomeAsset',
    '/Game/SomeAsset/Mesh/SK_SomeAsset_PhysicsAsset',
    '/Game/SomeAsset/SK_SomeAsset_Skeleton',
  ]
}
*/
```

## License
````
MIT License
----------
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
````
