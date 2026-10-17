import fs from 'fs';
import path from 'path';
// @ts-ignore
import solc from 'solc';

export interface CompiledContract {
  abi: any[];
  bytecode: string;
}

export function compileContracts(): {
  EuthynaVault: CompiledContract;
  MockUSDC: CompiledContract;
} {
  const contractsDir = path.resolve(__dirname, '../src');
  const vaultSource = fs.readFileSync(path.join(contractsDir, 'EuthynaVault.sol'), 'utf8');
  const erc20Source = fs.readFileSync(path.join(contractsDir, 'interfaces/IERC20.sol'), 'utf8');
  const venueSource = fs.readFileSync(path.join(contractsDir, 'interfaces/IVenueAdapter.sol'), 'utf8');

  // Standard MockUSDC with 6 decimals for testing
  const mockUSDCSource = `
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;

  contract MockUSDC {
      string public name = "USD Coin";
      string public symbol = "USDC";
      uint8 public decimals = 6;
      uint256 public totalSupply;
      mapping(address => uint256) public balanceOf;
      mapping(address => mapping(address => uint256)) public allowance;

      event Transfer(address indexed from, address indexed to, uint256 value);
      event Approval(address indexed owner, address indexed spender, uint256 value);

      function mint(address to, uint256 amount) external {
          balanceOf[to] += amount;
          totalSupply += amount;
          emit Transfer(address(0), to, amount);
      }

      function transfer(address recipient, uint256 amount) external returns (bool) {
          require(balanceOf[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");
          balanceOf[msg.sender] -= amount;
          balanceOf[recipient] += amount;
          emit Transfer(msg.sender, recipient, amount);
          return true;
      }

      function approve(address spender, uint256 amount) external returns (bool) {
          allowance[msg.sender][spender] = amount;
          emit Approval(msg.sender, spender, amount);
          return true;
      }

      function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
          require(balanceOf[sender] >= amount, "ERC20: transfer amount exceeds balance");
          require(allowance[sender][msg.sender] >= amount, "ERC20: allowance exceeded");
          allowance[sender][msg.sender] -= amount;
          balanceOf[sender] -= amount;
          balanceOf[recipient] += amount;
          emit Transfer(sender, recipient, amount);
          return true;
      }
  }
  `;

  const input = {
    language: 'Solidity',
    sources: {
      'EuthynaVault.sol': { content: vaultSource },
      'interfaces/IERC20.sol': { content: erc20Source },
      'interfaces/IVenueAdapter.sol': { content: venueSource },
      'MockUSDC.sol': { content: mockUSDCSource }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const fatal = output.errors.filter((e: any) => e.severity === 'error');
    if (fatal.length > 0) {
      throw new Error(`Solidity compilation failed:\n` + fatal.map((e: any) => e.formattedMessage).join('\n'));
    }
  }

  const vaultOutput = output.contracts['EuthynaVault.sol']['EuthynaVault'];
  const usdcOutput = output.contracts['MockUSDC.sol']['MockUSDC'];

  return {
    EuthynaVault: {
      abi: vaultOutput.abi,
      bytecode: '0x' + vaultOutput.evm.bytecode.object
    },
    MockUSDC: {
      abi: usdcOutput.abi,
      bytecode: '0x' + usdcOutput.evm.bytecode.object
    }
  };
}
