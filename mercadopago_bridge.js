/**
 * MercadoPago Payment Brick Bridge
 *
 * Bridges the MercadoPago JS SDK (Payment Brick) with the Flutter app.
 * Exposes window.MercadoPagoBridge with init, renderPaymentBrick, and destroy.
 */
(function () {
  var mp = null;
  var brickController = null;

  window.MercadoPagoBridge = {
    /**
     * Initializes the MercadoPago SDK with the given public key.
     * @param {string} publicKey - MercadoPago public key (APP_USR-xxx)
     */
    init: function (publicKey) {
      if (!window.MercadoPago) {
        console.error('MercadoPagoBridge: MercadoPago SDK not loaded');
        return;
      }
      mp = new MercadoPago(publicKey, { locale: 'es-CO' });
      console.log('MercadoPagoBridge: SDK initialized');
    },

    /**
     * Renders the Payment Brick inside the given container.
     * @param {object} config - Configuration object with:
     *   containerId, amount, backendUrl, authHeader, storeId (required),
     *   payer: {email, firstName, lastName} (optional),
     *   items: [{id, title, description, category_id, quantity, unit_price}] (optional),
     *   externalReference: string (optional),
     *   notificationUrl: string (optional)
     */
    renderPaymentBrick: function (config) {
      if (!mp) {
        console.error('MercadoPagoBridge: SDK not initialized. Call init() first.');
        return;
      }

      var containerId = config.containerId;
      var amount = config.amount;
      var backendUrl = config.backendUrl;
      var authHeader = config.authHeader;
      var storeId = config.storeId;
      var payerData = config.payer || {};
      var itemsData = config.items || [];
      var externalRef = config.externalReference || null;
      var notifUrl = config.notificationUrl || null;

      // Destroy previous brick if exists
      if (brickController) {
        try { brickController.unmount(); } catch (e) { }
        brickController = null;
      }

      var bricksBuilder = mp.bricks();

      // Build initialization with payer pre-fill (entityType required for PSE)
      var initConfig = { amount: amount };
      if (payerData.email) {
        initConfig.payer = {
          email: payerData.email,
          entityType: payerData.entityType || 'individual'
        };
        // Pre-fill identification if available
        if (payerData.identification) {
          initConfig.payer.identification = payerData.identification;
        }
      }

      bricksBuilder.create('payment', containerId, {
        initialization: initConfig,
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            bankTransfer: 'all'
          },
          visual: {
            style: {
              theme: 'default'
            }
          }
        },
        callbacks: {
          onReady: function () {
            window.mpBrickReady = true;
            console.log('MercadoPagoBridge: Brick ready');
            window.dispatchEvent(new CustomEvent('mpBrickReady'));
          },
          onSubmit: function (param) {
            var formData = param.formData;
            // Add store_id to the request (snake_case to match DTO)
            formData.store_id = storeId;

            // Set callback_url (clean URL without hash — MP may reject URLs with '#')
            if (!formData.callback_url) {
              formData.callback_url = window.location.origin + window.location.pathname;
            }

            // Enrich payer data with first_name and last_name
            if (payerData.firstName || payerData.lastName) {
              if (!formData.payer) formData.payer = {};
              if (payerData.firstName) formData.payer.first_name = payerData.firstName;
              if (payerData.lastName) formData.payer.last_name = payerData.lastName;
            }

            // Enrich payer address (requerido para PSE)
            if (payerData.address) {
              if (!formData.payer) formData.payer = {};
              formData.payer.address = payerData.address;
            }

            // Enrich payer phone (requerido para PSE)
            if (payerData.phone) {
              if (!formData.payer) formData.payer = {};
              formData.payer.phone = payerData.phone;
            }

            // Add external_reference
            if (externalRef) {
              formData.external_reference = externalRef;
            }

            // Add notification_url
            if (notifUrl) {
              formData.notification_url = notifUrl;
            }

            // Add statement_descriptor (appears on buyer's card statement)
            if (config.statementDescriptor) {
              formData.statement_descriptor = config.statementDescriptor;
            }

            // Add additional_info with items
            if (itemsData.length > 0) {
              formData.additional_info = { items: itemsData };
            }

            // ── Device fingerprint (required by MercadoPago fraud prevention) ──
            var deviceSessionId = '';
            try {
              // 1. Hidden input generated by the SDK fingerprint script
              var deviceInput = document.getElementById('deviceId');
              if (deviceInput) deviceSessionId = deviceInput.value;
              // 2. Global variable set by MercadoPago.js v2
              if (!deviceSessionId && window.MP_DEVICE_SESSION_ID) {
                deviceSessionId = window.MP_DEVICE_SESSION_ID;
              }
              // 3. Cookie fallback
              if (!deviceSessionId) {
                var cookieMatch = document.cookie.match(/MP_DEVICE_SESSION_ID=([^;]+)/);
                if (cookieMatch) deviceSessionId = cookieMatch[1];
              }
            } catch (e) {
              console.warn('MercadoPagoBridge: Could not obtain device session ID', e);
            }

            // ── Idempotency key (mandatory per MercadoPago) ──
            var idempotencyKey = 'pay_' + storeId + '_' + Date.now() + '_'
              + Math.random().toString(36).substr(2, 9);

            console.log('MercadoPagoBridge: onSubmit, sending to backend...');
            console.log('MercadoPagoBridge: deviceSessionId =', deviceSessionId);
            console.log('MercadoPagoBridge: formData =', JSON.stringify(formData, null, 2));

            return fetch(backendUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'X-meli-session-id': deviceSessionId,
                'X-Idempotency-Key': idempotencyKey
              },
              body: JSON.stringify(formData)
            })
              .then(function (response) {
                return response.json().then(function (data) {
                  if (!response.ok) {
                    throw new Error(data.error || data.message || 'Payment processing failed');
                  }
                  console.log('MercadoPagoBridge: Payment result', data);
                  window.dispatchEvent(new CustomEvent('mpPaymentSuccess', {
                    detail: JSON.stringify(data)
                  }));
                  return data;
                });
              })
              .catch(function (error) {
                console.error('MercadoPagoBridge: Payment error', error);
                window.dispatchEvent(new CustomEvent('mpPaymentError', {
                  detail: error.message || 'Error processing payment'
                }));
                throw error;
              });
          },
          onError: function (error) {
            console.error('MercadoPagoBridge: Brick error', error);
            window.dispatchEvent(new CustomEvent('mpBrickError', {
              detail: error.message || 'Payment brick error'
            }));
          }
        }
      }).then(function (controller) {
        brickController = controller;
        console.log('MercadoPagoBridge: Brick created successfully');
      }).catch(function (error) {
        console.error('MercadoPagoBridge: Error creating brick', error);
        window.dispatchEvent(new CustomEvent('mpBrickError', {
          detail: error.message || 'Error creating payment brick'
        }));
      });
    },

    /**
     * Destroys the current brick instance.
     */
    destroy: function () {
      if (brickController) {
        try {
          brickController.unmount();
          console.log('MercadoPagoBridge: Brick destroyed');
        } catch (e) {
          console.warn('MercadoPagoBridge: Error destroying brick', e);
        }
        brickController = null;
      }
      window.mpBrickReady = false;
    }
  };
})();
