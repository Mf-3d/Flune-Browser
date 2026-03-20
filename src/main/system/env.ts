// Intel Macでエラーが出るのを回避する
export function isArchitectureIntel(): boolean {
  const f = new Float32Array(1);
  const u8 = new Uint8Array(f.buffer);
  f[0] = Infinity;
  f[0] = f[0] - f[0];

  return u8[3] === 255;
}