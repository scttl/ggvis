context("Flatten")

test_that("props inherited from parent", {
  p <- gigvis(data = data.frame(),
    props = props(x = 1),
    node(
      props = props(y = 2),
      mark_line(x = 3)
    )
  )
  nodes <- gigvis_flatten(p)
  
  expect_equal(length(nodes), 1)
  props <- nodes[[1]]$props
  
  expect_equal(sort(names(props)), c("x", "y"))
  expect_equal(props$x$value, 3)
  expect_equal(props$y$value, 2)
})

test_that("data flows through pipeline", {
  df <- data.frame(x = 1, y = 2)
  p <- gigvis(data = df, props = props(x ~ x, y ~ y),
    node(node(node(node(node(mark_line()))))))
  nodes <- gigvis_flatten(p)
  
  expect_equal(length(nodes), 1)
  pipeline <- nodes[[1]]$pipeline
  
  expect_equal(isolate(pipeline()), df)
})