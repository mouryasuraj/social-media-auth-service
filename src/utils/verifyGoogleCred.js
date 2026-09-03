import { env } from "../config/index.js";
import {googleClient} from "../config/index.js";


export const verifyGoogleCred = async (credentials) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credentials,
    audience: env.GOOGLE_CLIENT,
  });

  const payload = ticket.getPayload();
  return payload
};

