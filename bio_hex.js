window.BioHex = {
  GENESIS_ONE: "0".repeat(63) + "1",

  generate() {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  },

  isValid(hex) {
    return typeof hex === "string" && /^[0-9a-fA-F]{64}$/.test(hex.trim());
  }
};


