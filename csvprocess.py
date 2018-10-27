import pandas
import sys

f = sys.argv[1]
table = pandas.read_csv(f, delimiter = ',', header = 'infer', index_col = None)
table.to_csv('test.csv')