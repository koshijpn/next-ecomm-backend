import app from "./app.js"
const port = process.env.PORT || 8080
const stripePort = process.env.STRIPE_PORT || 4242

app.listen(port, () => {
  console.log(`App started; listening on port ${port}`)
})


app.listen(stripePort, () =>{
  console.log(`Payment / listening on port ${stripePort}!`)
})
