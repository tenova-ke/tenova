import { NodeVM } from "vm2";

export function runCode(code: string) {
  try {
    const vm = new NodeVM({
      console: "redirect",
      sandbox: {},
      require: { external: true }
    });

    let output: any;
    const result = vm.run(`module.exports = () => { ${code} }`)();
    output = result;
    return { success: true, output };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
