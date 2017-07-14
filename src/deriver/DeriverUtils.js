let jose = require('node-jose');

class DeriverUtils {
  encryptBundle(appPublicKeyJwk, bundle) {
    bundle = jose.util.asBuffer(bundle);

    return jose.JWK.asKey(appPublicKeyJwk)
      .then(function (key) {
        var recipient = {
          key: key,
          header: {
            alg: 'ECDH-ES'
          }
        };

        var jwe = jose.JWE.createEncrypt({
          format: 'compact',
          contentAlg: 'A256GCM'
        }, recipient);

        return jwe.update(bundle)
          .final();
      });

  }
}

module.exports = DeriverUtils;
