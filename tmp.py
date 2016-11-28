from itertools import chain, combinations, permutations
import json
from pprint import pprint

def all_combinations(ss):
  return chain(*map(lambda x: combinations(ss, x), range(0, len(ss)+1)))

def all_permutations(arr):
  result = []
  for combination in all_combinations(arr):
    combination_permutations = list(permutations(combination))
    for permutation in combination_permutations:
      result.append(" ".join(permutation))
  return result

with open('question_list.json') as data_file:
  data = json.load(data_file)

result = set()
for level in data:
  for topic in level:
    for question in level[topic]:
      if 'type' in question and question['type'] == 1:
        tmp = all_permutations(question['answer'])
        result |= set(tmp)
      else:
        result |= set(question['answer'])

for el in result:
  print(el)
