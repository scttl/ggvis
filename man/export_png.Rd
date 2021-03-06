\name{export_png}
\alias{export_png}
\alias{export_svg}
\title{Export a PNG or SVG from a ggvis object}
\usage{
  export_png(x, envir = parent.frame(), file = NULL)

  export_svg(x, envir = parent.frame(), file = NULL)
}
\arguments{
  \item{x}{A ggvis object.}

  \item{envir}{The environment in which to evaluate
  \code{gv}.}

  \item{file}{Output file name. If NULL, defaults to
  "plot.svg" or "plot.png".}
}
\description{
  This requires that the external program \code{vg2png} is
  installed. This is part of \code{vega} node.js module.
}
\seealso{
  \url{https://github.com/trifacta/vega} for information on
  installing \code{vg2png} and \code{vg2svg}
}

