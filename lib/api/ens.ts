import sanitizeHtml from "sanitize-html";
import { l1Provider } from "@lib/chains";
import { EnsIdentity } from "./types/get-ens";

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "b",
    "i",
    "em",
    "strong",
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "ul",
    "br",
    "code",
    "span",
  ],
  disallowedTagsMode: "discard",
  allowedAttributes: {
    a: ["href"],
  },
  selfClosing: [
    "img",
    "br",
    "hr",
    "area",
    "base",
    "basefont",
    "input",
    "link",
    "meta",
  ],
  allowedSchemes: ["https", "mailto", "tel"],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
};

export const getEnsForAddress = async (address: string | null | undefined) => {
  const idShort = address?.replace(address?.slice(6, 38), "…");

  const name = address ? await l1Provider.lookupAddress(address) : null;

  if (name) {
    const resolver = await l1Provider.getResolver(name);
    const [description, url, twitter, github] = await Promise.all([
      resolver?.getText("description"),
      resolver?.getText("url"),
      resolver?.getText("com.twitter"),
      resolver?.getText("com.github"),
    ]);

    let avatar: string | null | undefined;
    try {
      const resolvedAvatar = await resolver?.getText("avatar");
      avatar = resolvedAvatar ? `/api/ens-data/image/${name}` : undefined;
    } catch (error) {
      console.error("Error fetching ENS avatar:", error);
      avatar = undefined;
    }

    const ens: EnsIdentity = {
      id: address ?? "",
      idShort: idShort ?? "",
      name: name ?? null,
      description: sanitizeHtml(nl2br(description), sanitizeOptions),
      url,
      twitter,
      github,
      avatar,
    };

    return ens;
  }

  const ens: EnsIdentity = {
    id: address ?? "",
    idShort: idShort ?? "",
    name: null,
  };

  return ens;
};

export const nl2br = (str, is_xhtml = true) => {
  if (typeof str === "undefined" || str === null) {
    return "";
  }
  var breakTag =
    is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
};
