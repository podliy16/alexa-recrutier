from itertools import chain, combinations, permutations
def all_combinations(ss):
  return chain(*map(lambda x: combinations(ss, x), range(0, len(ss)+1)))

stuff = ["local storage", "session storage", "cookies"]
for combination in all_combinations(stuff):
  combination_permutations = list(permutations(combination))
  for permutation in combination_permutations :
    print(" ".join(permutation))

