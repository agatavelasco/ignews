import { query as q }from 'faunadb';
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription (
  subscriptionId: string,
  customerId: string,
) {
  // Buscar usuario no banco faunaDB com o id customerId
  const userRef = await fauna.query(
   q.Select(
     "ref",
     q.Get(
      q.Match(
        q.Index('user_by_stripe_custumer_id'),
        customerId
      )
    )
   )
  )

  // Buscar todos os dados da subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Salvar os dados da subscription do usuario no faunaDB
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,

  }
  
  await fauna.query(
    q.Create(
      q.Collection('subscriptions'),
      { data: subscriptionData }
    )
  )
    
  
}