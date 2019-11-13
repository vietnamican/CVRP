# Capacity Vehicle Routing Problem(CVRP)

This is my big exercise of optimization course.

VRP is a problem in which you have to ship goods to N customers in N coordinate from one depot. You also have M container (or shipper).

CVRP is one of the VPR-extended, which container (or shipper) has a capacity C. We have to solve two objective function: Quantity of containers (shipper) and route of each container (shipper).                         

This project is written in Javascript (NodeJS), which have a amazing syntax for functional programming.
The dataset use for this repo: http://vrp.galgos.inf.puc-rio.br

I use a heuristic algorithm for this problem:
- Local search: Find the local max/min by swap one pair of node. 
- Random: Get out of local max/min to find a new local max/min by swap amount pair of node.

After 1 minute, it find the result with cost < +10% than best result.
