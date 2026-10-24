# expo-gl: `takeSnapshotAsync` with a 1x1 rect crashes on iOS

Minimal repro for [expo/expo#52213](https://github.com/expo/expo/issues/52213): a blank `create-expo-app` (SDK 58) plus `expo-gl` 58.0.3. The whole app is `App.js`.

On iOS, `GLView.takeSnapshotAsync(gl, { rect: { x: 0, y: 0, width: 1, height: 1 } })` aborts the app
instead of resolving or rejecting.

## Steps

```sh
pnpm install
npx expo run:ios --configuration Release
```

Use a 3x simulator (tested on iPhone 17 Pro, iOS 27.0).

1. Tap **Snapshot 4x4**. It resolves and prints the file URI.
2. Tap **Snapshot 1x1**. The app terminates.

Expected: a 1x1 image, or a rejected promise.

Actual:

```
*** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason:
'UIGraphicsBeginImageContext() failed to allocate CGBitampContext: size={0, 0}, scale=3.000000,
bitmapInfo=0x2002. Use UIGraphicsImageRenderer to avoid this assert.'
  3 UIKitCore      _UIGraphicsBeginImageContextWithOptions + 560
  4 <app>          __54-[EXGLContext takeSnapshotWithOptions:resolve:reject:]_block_invoke.16 + 756
  5 <app>          -[EXGLContext runInEAGLContext:callback:] + 64
```

Crashed queue: `host.exp.gl`, EXC_CRASH (SIGABRT).

`EXGLContext.mm` converts the pixel size to whole points with integer division
(`NSInteger widthInPoints = width / scale;`), so 1 px / 3 = 0 pt. The `width <= 0` guard above it
checks pixels, not points.
