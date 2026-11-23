export const semProtocolo = (endereco) =>
  endereco.replace(/^(https?:\/\/|mailto:)/, '').replace(/\/$/, '');
