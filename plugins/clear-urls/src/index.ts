// @description Removes tracking parameters from links you send and receive
// @version 1.0.0
// @author nexpid (original Valenced plugin); Phoenix port
// @note Tracking parameter list derived from ClearURLs Rules (CC BY 4.0)

const { gateway } = phoenix;

const settings = phoenix.settings.define({
  enabled: {
    type: "switch",
    title: "Clear URLs",
    description: "Strip tracking parameters from links in messages",
    default: true,
  },
  cleanOnCopy: {
    type: "switch",
    title: "Clean links in sent messages",
    description: "Also strip tracking parameters from links you send",
    default: true,
  },
});

// Tracking parameter patterns from ClearURLs Rules (globalRules +
// referralMarketing), the same list the Valenced original used.
// Source: https://gitlab.com/ClearURLs/rules/-/blob/master/data.min.json (CC BY 4.0)
const TRACKING_PARAMS = [
  "utm(?:_[a-z_]*)?",
  "mtm(?:_[a-z_]*)?",
  "ga_[a-z_]+",
  "yclid",
  "_openstat",
  "fb_action_(?:types|ids)",
  "fb_(?:source|ref)",
  "fbclid",
  "action_(?:object|type|ref)_map",
  "gs_l",
  "mkt_tok",
  "hmb_(?:campaign|medium|source)",
  "gclid",
  "srsltid",
  "otm_[a-z_]*",
  "cmpid",
  "os_ehash",
  "_ga",
  "_gl",
  "__twitter_impression",
  "wt_?z?mc",
  "wtrid",
  "[a-z]?mc",
  "dclid",
  "Echobox",
  "spm",
  "vn(?:_[a-z]*)+",
  "tracking_source",
  "ceneo_spo",
  "itm_(?:campaign|medium|source)",
  "__hsfp",
  "__hssc",
  "__hstc",
  "_hsenc",
  "__s",
  "hsCtaTracking",
  "mc_(?:eid|cid|tc)",
  "ml_subscriber",
  "ml_subscriber_hash",
  "msclkid",
  "oly_anon_id",
  "oly_enc_id",
  "rb_clickid",
  "s_cid",
  "vero_conv",
  "vero_id",
  "wickedid",
  "twclid",
  "ref_?",
  "referrer",
];

const TRACKING_RE = new RegExp(`([?&])(${TRACKING_PARAMS.join("|")})=[^&]*&?`, "gi");
const TRAILING_QS = /[?&]$/;

/** The original's cleanup, kept byte-for-byte in behaviour. */
const cleanUrl = (text: string) =>
  text
    .replace(TRACKING_RE, "$1")
    .replace(/([?&])+/g, "$1")
    .replace(TRAILING_QS, "")
    .replace(/\?#/, "#");

const cleanString = (value: string) => (value.includes("http") ? cleanUrl(value) : value);

// Incoming messages: the before-hook rewrites the payload Discord renders.
phoenix.hook(gateway.messageCreate, {
  before(message) {
    if (!settings.enabled) return;
    if (typeof message.content !== "string" || !message.content.includes("http")) return;
    message.content = cleanString(message.content);
  },
});

phoenix.hook(gateway.messageUpdate, {
  before(message) {
    if (!settings.enabled) return;
    if (typeof message.content !== "string" || !message.content.includes("http")) return;
    message.content = cleanString(message.content);
  },
});

// Outgoing messages. The original also patched Clipboard.setString; Phoenix
// only exposes `ui.copy`, whose output cannot be intercepted, so copying is
// handled by the message action below instead.
phoenix.messages.onSend((text) => {
  if (!settings.enabled || !settings.cleanOnCopy) return;
  if (!text.includes("http")) return;
  return cleanString(text);
});

phoenix.ui.addMessageAction({
  label: "Copy cleaned text",
  icon: "res://ic_mana_angle_brackets",
  visible: ({ message }) => !!message?.content?.includes("http"),
  onPress: ({ message }) => {
    if (!message?.content) return;
    phoenix.ui.copy(cleanString(message.content));
    phoenix.ui.toast("Copied without tracking parameters");
  },
});
